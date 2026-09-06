import React, { useRef } from 'react';
import { TrainSchedule, BlockRecommendation } from '../../types';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface VisualTimetableGanttProps {
  trains: TrainSchedule[];
  blocks: BlockRecommendation[];
}

export const VisualTimetableGantt: React.FC<VisualTimetableGanttProps> = ({ trains, blocks }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  const hours = Array.from({ length: 24 }, (_, i) => {
    const start = i.toString().padStart(2, '0') + ':00';
    const end = (i + 1).toString().padStart(2, '0') + ':00';
    return { start, end };
  });

  // Group trains by train_number
  const trainGroups: Record<string, TrainSchedule[]> = {};
  trains.forEach(t => {
    const tNum = t.train_number || 'UNKNOWN';
    if (!trainGroups[tNum]) trainGroups[tNum] = [];
    trainGroups[tNum]!.push(t);
  });
  
  const trainColors = [
    '#bde0fe', '#caffbf', '#ffc6ff', '#ffd6a5', '#e0c3fc', '#a0c4ff', '#fdffb6'
  ];
  
  const getEventStyle = (startTime: string | Date, endTime: string | Date, baseColor: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Normalize to same day for offset calculation if it crosses midnight (basic implementation)
    // Assuming events are within a 24h window
    const startMins = start.getHours() * 60 + start.getMinutes();
    let endMins = end.getHours() * 60 + end.getMinutes();
    
    if (endMins < startMins) endMins += 24 * 60; // Next day
    
    const leftPercent = (startMins / 1440) * 100;
    const widthPercent = ((endMins - startMins) / 1440) * 100;
    
    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
      backgroundColor: baseColor,
      position: 'absolute' as const,
      height: '32px',
      top: '50%',
      transform: 'translateY(-50%)',
      borderRadius: '4px',
      border: '1px solid rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#333',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
      padding: '0 4px',
      zIndex: 2,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };
  };

  const handleDownloadPDF = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await (html2canvas as any)(chartRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Railway_Time_Table_Maintenance_Plan.pdf');
    } catch (error) {
      console.error('Error generating PDF', error);
    }
  };

  return (
    <div style={{ padding: '0 24px 24px 24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="btn-formal" onClick={handleDownloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}>
          <Download size={16} /> Export High-Res PDF
        </button>
      </div>

      <div ref={chartRef} style={{ background: '#f4f9ff', border: '2px solid #6495ed', borderRadius: '12px', padding: '16px', fontFamily: 'sans-serif' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #6495ed', paddingBottom: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#1d4ed8', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '1.5rem', fontWeight: 800 }}>🚆</div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a', margin: 0 }}>Railway Time Table & Maintenance Plan</h1>
              <p style={{ margin: 0, fontWeight: 700, color: '#1e3a8a', marginTop: '4px' }}>Date: {new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontWeight: 700, color: '#1e3a8a' }}>
            <p style={{ margin: 0 }}>Corridor: CORRIDOR-A (Example Section)</p>
            <p style={{ margin: 0, marginTop: '4px' }}>KM Range: 120 - 130</p>
          </div>
        </div>

        {/* Chart Grid */}
        <div style={{ border: '1px solid #a4c8e1', borderRadius: '6px', background: '#fff' }}>
          
          {/* Header Row (Hours) */}
          <div style={{ display: 'flex', background: '#e0f0ff', borderBottom: '1px solid #a4c8e1' }}>
            <div style={{ width: '180px', flexShrink: 0, padding: '12px 16px', fontWeight: 800, color: '#1e3a8a', borderRight: '1px solid #a4c8e1', display: 'flex', alignItems: 'center' }}>
              Time
            </div>
            <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
              {hours.map((h, i) => (
                <div key={i} style={{ flex: 1, borderRight: i < 23 ? '1px solid #d1e5f0' : 'none', padding: '6px 0', textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#333' }}>
                  <div>{h.start}</div>
                  <div style={{ color: '#666' }}>- {h.end === '24:00' ? '00:00' : h.end}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trains Section */}
          <div style={{ background: '#f8fafd', padding: '8px 16px', fontWeight: 800, color: '#476b91', borderBottom: '1px solid #a4c8e1' }}>
            Trains
          </div>

          {Object.entries(trainGroups).map(([trainNo, runs], idx) => {
            const trainColor = trainColors[idx % trainColors.length] || '#bde0fe';
            return (
              <div key={trainNo} style={{ display: 'flex', borderBottom: '1px solid #e1eaf0' }}>
                <div style={{ width: '180px', flexShrink: 0, padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#333', borderRight: '1px solid #a4c8e1', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {trainNo} - {runs[0].train_name}
                </div>
                <div style={{ flex: 1, position: 'relative', height: '45px', borderRight: '1px solid transparent' }}>
                  {/* Grid Lines */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
                    {hours.map((_, i) => (
                      <div key={i} style={{ flex: 1, borderRight: i < 23 ? '1px solid #f1f5f9' : 'none' }}></div>
                    ))}
                  </div>
                  
                  {/* Event Blocks */}
                  {runs.map((run, rIdx) => (
                    <div key={rIdx} style={getEventStyle(run.scheduled_arrival!, run.scheduled_departure!, trainColor)}>
                      {(run.train_name || '').substring(0, 3).toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Maintenance Section */}
          <div style={{ background: '#e9d5ff', padding: '8px 16px', fontWeight: 800, color: '#581c87', borderBottom: '1px solid #a4c8e1' }}>
            Maintenance Blocks
          </div>

          {[
            { dept: 'ENGINEERING', label: 'Engineering (Track)' },
            { dept: 'SNT', label: 'S&T (Signal)' },
            { dept: 'TRACTION', label: 'Traction (OHE)' }
          ].map(deptRow => {
            const deptBlocks = blocks.filter(b => b.participating_departments.includes(deptRow.dept));
            return (
              <div key={deptRow.dept} style={{ display: 'flex', borderBottom: '1px solid #e1eaf0' }}>
                <div style={{ width: '180px', flexShrink: 0, padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#333', borderRight: '1px solid #a4c8e1', display: 'flex', alignItems: 'center' }}>
                  {deptRow.label}
                </div>
                <div style={{ flex: 1, position: 'relative', height: '55px' }}>
                   {/* Grid Lines */}
                   <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
                    {hours.map((_, i) => (
                      <div key={i} style={{ flex: 1, borderRight: i < 23 ? '1px solid #f1f5f9' : 'none' }}></div>
                    ))}
                  </div>

                  {deptBlocks.map(block => (
                    <div key={block.block_id} style={{
                      ...getEventStyle(block.start_time, block.end_time, '#fcd34d'),
                      height: '42px',
                      flexDirection: 'column'
                    }}>
                      <span>{block.block_id}</span>
                      <span style={{ fontSize: '0.6rem', fontWeight: 600 }}>KM {block.start_km}-{block.end_km}</span>
                      <span style={{ fontSize: '0.6rem', fontWeight: 500 }}>({block.duration_minutes / 60}h)</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer / Legend */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', gap: '16px' }}>
          
          <div style={{ flex: 2, background: '#fff', border: '1px solid #a4c8e1', borderRadius: '8px', padding: '12px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {Object.keys(trainGroups).slice(0, 8).map((trainNo, idx) => (
              <div key={trainNo} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, width: 'calc(25% - 12px)' }}>
                <div style={{ width: '16px', height: '16px', background: trainColors[idx % trainColors.length], border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }}></div>
                = Train ({(trainGroups[trainNo]![0]?.train_name || '').substring(0,3).toUpperCase()})
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, width: 'calc(25% - 12px)' }}>
              <div style={{ width: '16px', height: '16px', background: '#fcd34d', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }}></div>
              = Maintenance Block
            </div>
          </div>

          <div style={{ flex: 1, background: '#fff', border: '1px solid #a4c8e1', borderRadius: '8px', padding: '12px', fontSize: '0.75rem', color: '#1e3a8a' }}>
            <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              💡 Note:
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Maintenance blocks are scheduled in low-traffic windows.</li>
              <li>Blocks are spaced 45 mins apart for crew movement.</li>
              <li>KM range shows the affected track section.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
