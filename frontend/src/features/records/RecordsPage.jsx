import { useState } from 'react';
import jsPDF from 'jspdf';

export const RecordsPage = () => {
  const [recordText, setRecordText] = useState('Paciente evoluiu bem, sem dor pos-procedimento.');

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Prontuario Odontologico', 20, 20);
    doc.setFontSize(11);
    doc.text(recordText, 20, 40, { maxWidth: 170 });
    doc.save('prontuario.pdf');
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Prontuario e Anamnese</h2>
      <p className="text-sm text-slate-500">Registro clinico, historico e exportacao em PDF</p>
      <textarea
        value={recordText}
        onChange={(e) => setRecordText(e.target.value)}
        rows={8}
        className="w-full rounded-xl border border-slate-300 p-3 dark:bg-slate-900"
      />
      <button onClick={exportPdf} className="rounded-lg bg-emerald-600 px-4 py-2 text-white">
        Exportar PDF
      </button>
    </section>
  );
};

export default RecordsPage;
