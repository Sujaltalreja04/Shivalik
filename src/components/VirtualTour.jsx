import React from 'react';
import { PlayCircle } from 'lucide-react';

export default function VirtualTour() {
  return (
    <div className="glass-card h-100 flex flex-col align-center justify-center" style={{ position: 'relative', overflow: 'hidden' }}>
      <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop" 
           alt="360 Panaroma Placeholder" 
           style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, filter: 'blur(2px)' }} 
      />
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        <PlayCircle size={64} className="text-gold mb-3 mx-auto" />
        <h3>Immersive 360° Interior Walkthrough</h3>
        <p className="text-muted mt-2">Click and drag to pan around the living space. Virtual Tour engine initialized.</p>
        <button className="btn btn-gold mt-4">Start VR Experience</button>
      </div>
    </div>
  );
}
