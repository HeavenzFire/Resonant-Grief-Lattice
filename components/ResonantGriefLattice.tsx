
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { type GlyphState, type ColorTheme } from '../types';

interface ResonantGriefLatticeProps {
  audioData: number;
  isCalibrating: boolean;
  onStateChange: (state: GlyphState) => void;
}

const NUM_NODES = 150;
const VIOLET_COLORS = ['#4c1d95', '#5b21b6', '#6d28d9', '#a78bfa'];
const EMERALD_COLORS = ['#064e3b', '#059669', '#34d399', '#a7f3d0'];
const GOLD_COLORS = ['#f59e0b', '#facc15', '#fef08a', '#fde047'];

export const ResonantGriefLattice: React.FC<ResonantGriefLatticeProps> = ({ audioData, isCalibrating, onStateChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  // FIX: Explicitly initialize useRef with null to prevent potential type errors with zero-argument calls.
  const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined> | null>(null);
  const nodesRef = useRef<d3.SimulationNodeDatum[]>([]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const { width, height } = svg.node()!.getBoundingClientRect();
    
    // Initialize nodes
    if (nodesRef.current.length === 0) {
        nodesRef.current = Array.from({ length: NUM_NODES }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
        }));
    }

    // Initialize simulation
    const simulation = d3.forceSimulation(nodesRef.current)
      .force('charge', d3.forceManyBody().strength(-50))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.1))
      .on('tick', ticked);
    
    simulationRef.current = simulation;
    
    const nodeElements = svg.selectAll('circle')
      .data(nodesRef.current)
      .enter().append('circle')
      .attr('r', 2)
      .attr('fill', VIOLET_COLORS[0]);

    function ticked() {
      nodeElements
        .attr('cx', d => (d as any).x)
        .attr('cy', d => (d as any).y);
    }

    return () => {
        simulation.stop();
        svg.selectAll('*').remove();
        nodesRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!simulationRef.current || !isCalibrating) return;

    const simulation = simulationRef.current;
    
    // Normalize audioData (0 to 1)
    const normalizedAudio = Math.min(audioData / 128, 1);

    // Lauren's Lambda (Cohesion) vs Bryer's Beam (Chaos)
    // Low, calm breath (low audio) increases cohesion
    // High, sharp breath (high audio) increases chaos
    const cohesionStrength = (1 - normalizedAudio) * 0.1; // Stronger centering force with calm
    const chaosStrength = -5 - (normalizedAudio * 150);   // More repulsion with noise
    
    simulation.force('center', d3.forceCenter(svgRef.current!.clientWidth / 2, svgRef.current!.clientHeight / 2).strength(cohesionStrength));
    simulation.force('charge', d3.forceManyBody().strength(chaosStrength));
    
    // Update colors and radii based on cohesion
    const cohesionFactor = 1 - normalizedAudio;
    let currentColorTheme: ColorTheme = 'violet';
    let colorScale: d3.ScaleQuantile<string>;
    
    if (cohesionFactor > 0.85) {
        colorScale = d3.scaleQuantile<string>().domain([0, 1]).range(GOLD_COLORS);
        currentColorTheme = 'gold';
    } else if (cohesionFactor > 0.6) {
        colorScale = d3.scaleQuantile<string>().domain([0, 1]).range(EMERALD_COLORS);
        currentColorTheme = 'emerald';
    } else {
        colorScale = d3.scaleQuantile<string>().domain([0, 1]).range(VIOLET_COLORS);
        currentColorTheme = 'violet';
    }
    
    d3.select(svgRef.current).selectAll('circle')
      .transition().duration(200)
      .attr('r', 1 + cohesionFactor * 4)
      .attr('fill', () => colorScale(Math.random()))
      .style('filter', cohesionFactor > 0.85 ? 'blur(0.5px)' : 'none');

    onStateChange({ complexity: cohesionFactor, color: currentColorTheme });

    simulation.alpha(0.3).restart();

  }, [audioData, isCalibrating, onStateChange]);


  return (
    <svg ref={svgRef} className="w-full h-full"></svg>
  );
};
