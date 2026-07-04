import { useState } from 'react';
import { UploadCloud, Bug } from 'lucide-react';
import api from '../api';

export default function PestScanner({ crop = '' }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setDiagnosis(null);
      setError(null);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setIsScanning(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('crop', crop || 'Unknown');

    try {
      const res = await api.post('/agent/pest-scan', formData);
      setDiagnosis(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to scan image. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const treatment = diagnosis?.treatmentSpecs?.organic?.[0]
    || diagnosis?.treatmentSpecs?.chemical?.[0]
    || diagnosis?.treatmentSpecs?.preventative?.[0];

  return (
    <div className="card-surface p-8 mt-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-wheat p-3 rounded-full text-terracotta">
          <Bug size={24} />
        </div>
        <div>
          <h3 className="text-xl font-serif text-charcoal font-semibold">Pest & Disease Scanner</h3>
          <p className="text-sm text-charcoal/60">Upload a leaf photo for specialized AI pathology analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="upload-zone">
          {preview ? (
            <div className="space-y-4">
              <img src={preview} alt="Plant leaf preview" className="max-h-48 rounded-md mx-auto shadow-sm" />
              <button 
                onClick={handleScan}
                disabled={isScanning}
                className="btn-accent px-6 py-2"
              >
                {isScanning ? 'Scanning via Claude Vision...' : 'Scan Now'}
              </button>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center text-sage-700 hover:text-sage-500 transition-colors duration-150 active:text-sage-400">
              <UploadCloud size={40} className="mb-2" />
              <span className="font-medium">Click to upload leaf photo</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          )}
        </div>

        <div className="bg-cream/60 p-6 rounded-organic border border-sage/30 flex flex-col justify-center min-h-[250px]">
          {error && <p className="text-terracotta text-sm">{error}</p>}
          {diagnosis && (
            <>
              <h4 className="text-lg font-semibold text-charcoal mb-4 pb-2 border-b border-sage/30">Diagnosis Report</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-charcoal/60 font-medium">Issue</span>
                  <span className="text-terracotta font-semibold">{diagnosis.diagnosis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal/60 font-medium">Confidence</span>
                  <span className="text-sage font-bold">{diagnosis.confidence}%</span>
                </div>
                <div className="pt-4 space-y-1">
                  <p className="text-charcoal/60 font-medium text-sm">Recommended Action</p>
                  <p className="text-charcoal/90">{treatment || 'Consult local extension officer for treatment plan.'}</p>
                </div>
              </div>
            </>
          )}
          {!diagnosis && !error && (
            <p className="text-charcoal/50 text-center">Upload a leaf image and scan to see diagnosis results here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
