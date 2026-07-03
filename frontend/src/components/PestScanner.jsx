import { useState } from 'react';
import { UploadCloud, Bug } from 'lucide-react';
import axios from 'axios';

export default function PestScanner() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setDiagnosis(null);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setIsScanning(true);
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('crop', 'Unknown'); 

    try {
      const res = await axios.post('http://localhost:5000/api/agent/pest-scan', formData);
      setDiagnosis(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to scan image");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-organic shadow-soft border border-sage/10 mt-12">
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
        <div className="border-2 border-dashed border-sage/40 rounded-organic p-8 text-center flex flex-col items-center justify-center bg-cream/30 min-h-[250px]">
          {preview ? (
            <div className="space-y-4">
              <img src={preview} alt="Plant" className="max-h-48 rounded-md mx-auto shadow-sm" />
              <button 
                onClick={handleScan}
                disabled={isScanning}
                className="bg-terracotta hover:bg-terracotta/90 text-white px-6 py-2 rounded-md font-medium transition-all"
              >
                {isScanning ? 'Scanning via Claude Vision...' : 'Scan Now'}
              </button>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center text-sage/70 hover:text-sage transition-colors">
              <UploadCloud size={40} className="mb-2" />
              <span className="font-medium">Click to upload leaf photo</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          )}
        </div>

        {diagnosis && (
          <div className="bg-cream/50 p-6 rounded-organic border border-sage/20 flex flex-col justify-center">
            <h4 className="text-lg font-semibold text-charcoal mb-4 pb-2 border-b border-sage/20">Diagnosis Report</h4>
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
                <p className="text-charcoal/90">{diagnosis.treatmentSpecs?.organic?.[0] || 'No specific organic treatment found. Seek broad spectrum fungicides.'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
