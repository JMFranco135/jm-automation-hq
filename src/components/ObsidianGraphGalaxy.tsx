import { useEffect, useRef, useState, useCallback } from 'react'
import { select } from 'd3-selection'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import { zoom as d3ZoomBehavior, ZoomBehavior, zoomIdentity } from 'd3-zoom'
import { drag as d3DragBehavior, DragBehavior } from 'd3-drag'

type Node = {
  id: string
  label: string
  type: string
  path?: string
  folder?: string
  linkCount?: number
  x?: number
  y?: number
  vx?: number
  vy?: number
  pinned?: boolean
  unresolved?: boolean
}

type Link = {
  source: string | Node
  target: string | Node
  unresolved?: boolean
}

type GraphData = {
  nodes: Node[]
  edges: Link[]
  message?: string
}

const COLORS = {
  agent: '#FF6B6B',
  sop: '#4FD1C5',
  client: '#4DB8FF',
  fix: '#9AE6B4',
  home: '#FFE9A8',
  other: '#A9A7C7'
}

export default function ObsidianGraphGalaxy() {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const simRef = useRef<any>(null)
  const zoomRef = useRef<any>(null)
  const nodesRef = useRef<Map<string, Node>>(new Map())
  const linksRef = useRef<Link[]>([])
  const pollRef = useRef<number | null>(null)
  const dragTimeoutRef = useRef<number | null>(null)
  const toastRef = useRef<HTMLDivElement>(null)

  const showToast = useCallback((msg: string) => {
    if (!toastRef.current) return
    toastRef.current.textContent = msg
    toastRef.current.style.opacity = '1'
    setTimeout(() => {
      if (toastRef.current) toastRef.current.style.opacity = '0'
    }, 3000)
  }, [])

  const openInObsidian = useCallback((node: Node) => {
    if (!node.path) {
      showToast(`Path not found: ${node.label}`)
      return
    }
    const vaultName = 'claude-website-local'
    const encoded = encodeURIComponent(node.path)
    const uri = `obsidian://open?vault=${vaultName}&file=${encoded}`
    window.open(uri, '_blank').catch(() => {
      showToast(`Open in Obsidian: ${node.path}`)
    })
  }, [showToast])

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/vault/graph', { cache: 'no-store' })
      const data: GraphData = await res.json()

      if (data.message) {
        setMessage(data.message)
        return
      }
      setMessage(null)

      const newNodesMap = new Map<string, Node>()
      data.nodes?.forEach(n => newNodesMap.set(n.id, { ...n }))

      const existingNodes = nodesRef.current
      const mergedNodes: Node[] = []

      // Preserve positions
      for (const [id, newNode] of newNodesMap) {
        const existing = existingNodes.get(id)
        if (existing) {
          mergedNodes.push({
            ...newNode,
            x: existing.x,
            y: existing.y,
            vx: existing.vx,
            vy: existing.vy,
            pinned: existing.pinned
          })
        } else {
          // New node - gentle nudge
          mergedNodes.push({
            ...newNode,
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50
          })
        }
      }

      // Deduplicate and stabilize links
      const newLinks = (data.edges || []).filter(e => !e.unresolved).map(e => ({
        source: e.source,
        target: e.target,
        unresolved: e.unresolved
      }))

      const existingIds = new Set(existingNodes.keys())
      const newIds = new Set(newNodesMap.keys())
      const removed = [...existingIds].filter(id => !newIds.has(id))
      const added = [...newIds].filter(id => !existingIds.has(id))

      if (removed.length === 0 && added.length === 0 && JSON.stringify(linksRef.current) === JSON.stringify(newLinks)) {
        return // No changes
      }

      nodesRef.current = new Map(mergedNodes.map(n => [n.id, n]))
      linksRef.current = newLinks

      // Update simulation
      if (simRef.current) {
        simRef.current.nodes(mergedNodes as any)
        const linkForce = simRef.current.force('link') as d3.ForceLink<Node, Link>
        if (linkForce) {
          linkForce.links(newLinks)
        }
        simRef.current.alpha(0.1).restart()
        if (added.length > 0) {
          simRef.current.alphaTarget(0.1)
          setTimeout(() => simRef.current?.alphaTarget(0), 1000)
        }
      }
    } catch (e) {
      console.error('Failed to load graph:', e)
      setMessage('Error loading vault graph')
    }
  }, [])

  useEffect(() => {
    loadData()
    pollRef.current = window.setInterval(() => {
      if (!isDragging) loadData()
    }, 5000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [loadData, isDragging])

  useEffect(() => {
    const container = containerRef.current
    const svg = svgRef.current
    if (!container || !svg) return

    const width = container.clientWidth
    const height = container.clientHeight

    const svgEl = select(svg)
    svgEl.selectAll('*').remove()

    svgEl.attr('width', width)
          .attr('height', height)
          .style('background', 'transparent')

    const g = svgEl.append('g')

    // Zoom behavior
    const zoom = d3ZoomBehavior<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString())
      })

    zoomRef.current = zoom
    svgEl.call(zoom as any)

    const linkGroup = g.append('g').attr('class', 'links')
    const nodeGroup = g.append('g').attr('class', 'nodes')
    const labelGroup = g.append('g').attr('class', 'labels')

    // Simulation
    const simulation = forceSimulation<Node>()
      .force('link', forceLink<Node, Link>().id(d => d.id).distance(100).strength(0.3))
      .force('charge', forceManyBody().strength(-300))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collision', forceCollide().radius(d => Math.max(15, (d.linkCount || 0) * 1.2 + 8)))

    simRef.current = simulation

    let hoveredNodeId: string | null = null
    let selectedNodeId: string | null = null

    const updateGraph = () => {
      const nodes = Array.from(nodesRef.current.values())
      const links = linksRef.current

      // Links
      const link = linkGroup.selectAll('line')
        .data(links, d => `${d.source}-${d.target}`)

      link.exit().remove()

      const linkEnter = link.enter()
        .append('line')
        .attr('stroke', d => {
          if (d.unresolved) return 'rgba(255,100,100,0.3)'
          const src = typeof d.source === 'string' ? d.source : d.source.id
          const tgt = typeof d.target === 'string' ? d.target : d.target.id
          const srcNode = nodes.find(n => n.id === src)
          const tgtNode = nodes.find(n => n.id === tgt)
          const srcColor = srcNode ? COLORS[srcNode.type as keyof typeof COLORS] || COLORS.other : COLORS.other
          return `${srcColor}80`
        })
        .attr('stroke-opacity', 0.2)
        .attr('stroke-width', 1)

      linkEnter.merge(link)
        .attr('stroke-opacity', d => {
          if (d.unresolved) return 0.1
          const src = typeof d.source === 'string' ? d.source : d.source.id
          const tgt = typeof d.target === 'string' ? d.target : d.target.id
          const isNeighbor = hoveredNodeId && (src === hoveredNodeId || tgt === hoveredNodeId)
          const isSelected = selectedNodeId && (src === selectedNodeId || tgt === selectedNodeId)
          return isNeighbor || isSelected ? 0.8 : 0.2
        })
        .attr('stroke-width', d => {
          const src = typeof d.source === 'string' ? d.source : d.source.id
          const tgt = typeof d.target === 'string' ? d.target : d.target.id
          const isNeighbor = hoveredNodeId && (src === hoveredNodeId || tgt === hoveredNodeId)
          return isNeighbor ? 2 : 1
        })

      // Nodes
      const node = nodeGroup.selectAll('g')
        .data(nodes, d => d.id)

      const nodeEnter = node.enter()
        .append('g')
        .attr('class', 'node')
        .style('cursor', 'pointer')
        .call(d3DragBehavior<SVGGElement, Node>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
            setIsDragging(true)
            if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current)
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            setTimeout(() => setIsDragging(false), 100)
            dragTimeoutRef.current = window.setTimeout(() => {
              d.fx = null
              d.fy = null
            }, 500) as unknown as number
          }) as any)

      nodeEnter.append('circle')
        .attr('r', d => Math.max(4, Math.min(18, 4 + (d.linkCount || 0) * 0.8)))
        .attr('fill', d => COLORS[d.type as keyof typeof COLORS] || COLORS.other)
        .attr('fill-opacity', d => d.unresolved ? 0.3 : 0.7)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .attr('filter', 'drop-shadow(0 0 8px currentColor)')

      nodeEnter.append('title')
        .text(d => `${d.label}\n${d.folder || ''}\nLinks: ${d.linkCount || 0}`)

      const nodeMerge = nodeEnter.merge(node as any)

      nodeMerge
        .attr('opacity', d => {
          if (!hoveredNodeId) return 1
          const isHovered = d.id === hoveredNodeId
          const isNeighbor = links.some(l => {
            const src = typeof l.source === 'string' ? l.source : l.source.id
            const tgt = typeof l.target === 'string' ? l.target : l.target.id
            return (src === hoveredNodeId && tgt === d.id) || (tgt === hoveredNodeId && src === d.id)
          })
          return isHovered || isNeighbor ? 1 : 0.15
        })

      nodeMerge.select('circle')
        .attr('r', d => Math.max(4, Math.min(18, 4 + (d.linkCount || 0) * 0.8)))
        .attr('fill', d => COLORS[d.type as keyof typeof COLORS] || COLORS.other)
        .attr('fill-opacity', d => {
          if (!hoveredNodeId) return d.unresolved ? 0.3 : 0.7
          const isHovered = d.id === hoveredNodeId
          const isNeighbor = links.some(l => {
            const src = typeof l.source === 'string' ? l.source : l.source.id
            const tgt = typeof l.target === 'string' ? l.target : l.target.id
            return (src === hoveredNodeId && tgt === d.id) || (tgt === hoveredNodeId && src === d.id)
          })
          return (isHovered || isNeighbor) ? 1 : 0.1
        })
        .attr('stroke-width', d => {
          const isHovered = d.id === hoveredNodeId
          return isHovered ? 3 : 1.5
        })

      // Labels
      const labels = labelGroup.selectAll('text')
        .data(nodes.filter(d => (d.linkCount || 0) > 2 || d.id === hoveredNodeId || d.id === selectedNodeId), d => d.id)

      labels.exit().remove()

      const labelEnter = labels.enter()
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 4)
        .attr('font-size', '10px')
        .attr('fill', '#e5e7eb')
        .attr('pointer-events', 'none')
        .attr('opacity', 0)

      labelEnter.merge(labels as any)
        .attr('opacity', d => {
          const scale = select(svgEl.node() as Element).node()?.getCTM()?.a || 1
          return scale > 0.8 ? 0.9 : 0
        })
        .text(d => d.label.length > 20 ? d.label.slice(0, 18) + '...' : d.label)

      // Events
      nodeMerge
        .on('mouseover', (event, d) => {
          hoveredNodeId = d.id
          updateGraph()
        })
        .on('mouseout', () => {
          hoveredNodeId = null
          updateGraph()
        })
        .on('click', (event, d) => {
          event.stopPropagation()
          openInObsidian(d)
        })

      g.on('click', () => {
        selectedNodeId = null
        updateGraph()
      })

      // Tick
      simulation.on('tick', () => {
        linkGroup.selectAll('line')
          .attr('x1', d => {
            const src = typeof d.source === 'string' ? nodes.find(n => n.id === d.source) : d.source
            return src?.x || 0
          })
          .attr('y1', d => {
            const src = typeof d.source === 'string' ? nodes.find(n => n.id === d.source) : d.source
            return src?.y || 0
          })
          .attr('x2', d => {
            const tgt = typeof d.target === 'string' ? nodes.find(n => n.id === d.target) : d.target
            return tgt?.x || 0
          })
          .attr('y2', d => {
            const tgt = typeof d.target === 'string' ? nodes.find(n => n.id === d.target) : d.target
            return tgt?.y || 0
          })

        nodeGroup.selectAll('g')
          .attr('transform', d => `translate(${d.x},${d.y})`)

        labelGroup.selectAll('text')
          .attr('x', d => d.x || 0)
          .attr('y', (d: any) => (d.y || 0) + (Math.max(4, Math.min(18, 4 + (d.linkCount || 0) * 0.8)) + 12))
      })

      const validLinks = links.filter(l => {
        const src = typeof l.source === 'string' ? l.source : l.source.id
        const tgt = typeof l.target === 'string' ? l.target : l.target.id
        return !src.startsWith('unresolved:') && !tgt.startsWith('unresolved:')
      })
      simulation.nodes(nodes as any)
      const linkForce = simulation.force('link') as d3.ForceLink<Node, Link>
      if (linkForce) {
        linkForce.links(validLinks)
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      svgEl.attr('width', newWidth).attr('height', newHeight)
      simulation.force('center', forceCenter(newWidth / 2, newHeight / 2))
      simulation.alpha(0.3).restart()
    })
    resizeObserver.observe(container)

    loadData().then(() => {
      updateGraph()
    })

    return () => {
      resizeObserver.disconnect()
      simulation.stop()
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [loadData, openInObsidian])

  const zoomIn = () => {
    const svg = svgRef.current
    if (!svg || !zoomRef.current) return
    const t = zoomRef.current
    select(svg).transition().duration(300).call(t.scaleBy, 1.2)
  }

  const zoomOut = () => {
    const svg = svgRef.current
    if (!svg || !zoomRef.current) return
    const t = zoomRef.current
    select(svg).transition().duration(300).call(t.scaleBy, 0.8)
  }

  const resetView = () => {
    const svg = svgRef.current
    if (!svg || !zoomRef.current) return
    select(svg).transition().duration(750).call(
      zoomRef.current.transform,
      zoomIdentity
    )
  }

  const refresh = () => loadData()
  const [showControls, setShowControls] = useState(true)

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 0, minWidth: 0, position: 'relative', background: 'transparent' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }} />
      <button onClick={() => setShowControls(s => !s)} style={{ position: 'absolute', bottom: 16, right: 16, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', cursor: 'pointer', fontSize: 12, padding: '6px 10px', zIndex: 10 }} title="Toggle controls">{showControls ? 'Hide controls' : 'Show controls'}</button>

      {message && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'var(--muted)',
          background: 'var(--glass-bg)',
          padding: '24px 32px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(var(--blur-md))'
        }}>
          <div style={{ fontSize: 16, marginBottom: 8 }}>Obsidian Vault</div>
          <div style={{ fontSize: 14 }}>{message}</div>
        </div>
      )}

      {showControls && (
        <div style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          display: 'flex',
          gap: 8,
          background: 'var(--glass-bg)',
          padding: 8,
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(var(--blur-md))',
          zIndex: 10
        }}>
          <button onClick={zoomIn} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', cursor: 'pointer', fontSize: 12 }}>+</button>
          <button onClick={zoomOut} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', cursor: 'pointer', fontSize: 12 }}>-</button>
          <button onClick={resetView} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', cursor: 'pointer', fontSize: 12 }}>Reset</button>
          <button onClick={refresh} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', cursor: 'pointer', fontSize: 12 }}>Refresh</button>
        </div>
      )}

      <div ref={toastRef} style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--glass-bg)',
        padding: '8px 16px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text)',
        fontSize: 12,
        opacity: 0,
        transition: 'opacity 0.3s',
        pointerEvents: 'none'
      }} />
    </div>
  )
}
