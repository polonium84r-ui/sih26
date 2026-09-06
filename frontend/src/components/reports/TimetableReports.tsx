import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TrainSchedule, BlockRecommendation } from '../../types';
import { Download, FileText, Layout, Clock, Calendar, BarChart2 } from 'lucide-react';
import { VisualTimetableGantt } from './VisualTimetableGantt';

interface TimetableReportsProps {
  trains: TrainSchedule[];
  blocks: BlockRecommendation[];
}

export const TimetableReports: React.FC<TimetableReportsProps> = ({ trains, blocks }) => {
  const [view, setView] = useState<'visual' | 'merged' | 'trains' | 'blocks'>('visual');

  const downloadPDF = (title: string, filename: string, headers: string[], rows: any[][]) => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    
    (autoTable as any)(doc, {
      head: [headers],
      body: rows,
      startY: 25,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 0, 0] }
    });
    
    doc.save(filename);
  };

  const exportTrains = () => {
    const headers = ["Train No", "Name", "Category", "Arrival", "Departure", "Start KM", "End KM"];
    const rows = trains.map(t => [
      t.train_number,
      `"${t.train_name}"`,
      t.type_label || t.train_type,
      new Date(t.scheduled_arrival).toLocaleTimeString(),
      new Date(t.scheduled_departure).toLocaleTimeString(),
      t.start_km,
      t.end_km
    ]);
    downloadPDF("Train Timetable Report", "Train_Timetable_Report.pdf", headers, rows);
  };

  const exportBlocks = () => {
    const headers = ["Block ID", "Departments", "Start Time", "End Time", "Duration (mins)", "Start KM", "End KM", "Status"];
    const rows = blocks.map(b => [
      b.block_id,
      `"${b.participating_departments.join(' + ')}"`,
      new Date(b.start_time).toLocaleTimeString(),
      new Date(b.end_time).toLocaleTimeString(),
      b.duration_minutes,
      b.start_km,
      b.end_km,
      b.conflict_status
    ]);
    downloadPDF("Maintenance Blocks Report", "Maintenance_Blocks_Report.pdf", headers, rows);
  };

  const exportMerged = () => {
    const headers = ["Event Time", "Event Type", "ID/Number", "Name/Depts", "Location (KM)"];
    
    const mergedList = getMergedEvents();
    const rows = mergedList.map(ev => [
      new Date(ev.time).toLocaleTimeString(),
      ev.type,
      ev.id,
      `"${ev.desc}"`,
      `KM ${ev.startKm} - ${ev.endKm}`
    ]);
    downloadPDF("Merged Master Timetable", "Merged_Master_Timetable.pdf", headers, rows);
  };

  const getMergedEvents = () => {
    const events: any[] = [];
    
    trains.forEach(t => {
      events.push({
        time: new Date(t.scheduled_arrival),
        type: 'Train',
        id: t.train_number,
        desc: t.train_name,
        startKm: t.start_km,
        endKm: t.end_km,
        raw: t
      });
    });

    blocks.forEach(b => {
      events.push({
        time: new Date(b.start_time),
        type: 'Maintenance Block',
        id: b.block_id,
        desc: b.participating_departments.join(' + '),
        startKm: b.start_km,
        endKm: b.end_km,
        raw: b
      });
    });

    return events.sort((a, b) => a.time.getTime() - b.time.getTime());
  };

  const mergedEvents = getMergedEvents();

  return (
    <div style={{ padding: '0 24px 24px 24px' }}>
      <div className="formal-panel" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={22} /> MASTER TIMETABLE REPORTS
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              View and download integrated schedules for passenger trains and AI maintenance blocks.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-formal" onClick={exportMerged} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}>
              <Download size={14} /> Download Merged PDF
            </button>
            <button className="btn-secondary" onClick={exportTrains} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
              <Download size={14} /> Trains PDF
            </button>
            <button className="btn-secondary" onClick={exportBlocks} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
              <Download size={14} /> Blocks PDF
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button onClick={() => setView('visual')} style={{ padding: '8px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', background: view === 'visual' ? '#000' : '#fff', color: view === 'visual' ? '#fff' : '#000', border: '1px solid #000' }}>
          <BarChart2 size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
          Visual Gantt Chart (Recommended)
        </button>
        <button onClick={() => setView('merged')} style={{ padding: '8px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', background: view === 'merged' ? '#000' : '#fff', color: view === 'merged' ? '#fff' : '#000', border: '1px solid #000' }}>
          <Layout size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
          Merged Table View
        </button>
        <button onClick={() => setView('trains')} style={{ padding: '8px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', background: view === 'trains' ? '#000' : '#fff', color: view === 'trains' ? '#fff' : '#000', border: '1px solid #000' }}>
          <Clock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
          Train Timetable
        </button>
        <button onClick={() => setView('blocks')} style={{ padding: '8px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', background: view === 'blocks' ? '#000' : '#fff', color: view === 'blocks' ? '#fff' : '#000', border: '1px solid #000' }}>
          <Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
          Maintenance Blocks
        </button>
      </div>

      {view === 'visual' ? (
        <VisualTimetableGantt trains={trains} blocks={blocks} />
      ) : (
      <div className="formal-panel" style={{ padding: '20px' }}>
        {view === 'merged' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f1f3f5', textAlign: 'left' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Event Time</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Type</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Identifier</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Details</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Location</th>
              </tr>
            </thead>
            <tbody>
              {mergedEvents.map((ev, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', background: ev.type === 'Maintenance Block' ? '#fffbeb' : '#fff' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 800 }}>{ev.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td style={{ padding: '12px 10px', fontWeight: 700 }}>
                    <span style={{ background: ev.type === 'Maintenance Block' ? '#d97706' : '#1d4ed8', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                      {ev.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', fontFamily: 'monospace' }}>{ev.id}</td>
                  <td style={{ padding: '12px 10px' }}>{ev.desc}</td>
                  <td style={{ padding: '12px 10px' }}>KM {ev.startKm} - {ev.endKm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {view === 'trains' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f1f3f5', textAlign: 'left' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Train No.</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Name</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Arrival</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Location</th>
              </tr>
            </thead>
            <tbody>
              {trains.map((t) => (
                <tr key={t.train_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 800, fontFamily: 'monospace' }}>{t.train_number}</td>
                  <td style={{ padding: '12px 10px', fontWeight: 700 }}>{t.train_name}</td>
                  <td style={{ padding: '12px 10px', fontFamily: 'monospace' }}>{new Date(t.scheduled_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td style={{ padding: '12px 10px' }}>KM {t.start_km} - {t.end_km}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {view === 'blocks' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f1f3f5', textAlign: 'left' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Block ID</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Depts</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Start Time</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Duration</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #000' }}>Location</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((b) => (
                <tr key={b.block_id} style={{ borderBottom: '1px solid var(--border-color)', background: '#fffbeb' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 800, fontFamily: 'monospace' }}>{b.block_id}</td>
                  <td style={{ padding: '12px 10px', fontWeight: 700 }}>{b.participating_departments.join(' + ')}</td>
                  <td style={{ padding: '12px 10px', fontFamily: 'monospace' }}>{new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td style={{ padding: '12px 10px' }}>{b.duration_minutes} mins</td>
                  <td style={{ padding: '12px 10px' }}>KM {b.start_km} - {b.end_km}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      )}
    </div>
  );
};
