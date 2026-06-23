import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getTransformation, updateTransformationLabel } from '../lib/api';
import { ArrowLeft, Edit2, Check } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import TransformOutput from '../components/transform/TransformOutput';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function TransformDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState('');

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await getTransformation(id);
        setData(res);
        setLabelValue(res.label || res.detected_job_title || 'Resume Optimization');
      } catch (err) {
        toast.error('Failed to load past optimization.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id, navigate]);

  const handleUpdateLabel = async () => {
    if (!labelValue.trim()) return;
    try {
      await updateTransformationLabel(id, labelValue.trim());
      setData(prev => ({ ...prev, label: labelValue.trim() }));
      setEditingLabel(false);
      toast.success('Label updated');
    } catch (err) {
      toast.error('Failed to update label.');
    }
  };

  return (
    <div className="min-h-screen bg-mist flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex flex-col justify-start">
        {loading ? (
          <div className="flex justify-center items-center py-24 my-auto">
            <div className="w-8 h-8 border-2 border-cobalt border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-6 w-full animate-fade-in">
            {/* Back controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-graphite hover:text-ink transition-colors font-medium">
                <ArrowLeft size={16} />
                Back to Dashboard
              </Link>

              {/* Editable Label */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {editingLabel ? (
                  <div className="flex items-center gap-2 w-full sm:w-64">
                    <Input
                      type="text"
                      value={labelValue}
                      onChange={(e) => setLabelValue(e.target.value)}
                      className="py-1 px-2.5 text-sm"
                      maxLength={100}
                    />
                    <Button variant="primary" size="sm" onClick={handleUpdateLabel} className="shrink-0 p-2">
                      <Check size={14} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-graphite font-mono">
                      Label: {data.label || 'None'}
                    </span>
                    <button
                      onClick={() => setEditingLabel(true)}
                      className="p-1 hover:bg-mist text-graphite hover:text-ink rounded transition-colors"
                      title="Edit label"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Output preview */}
            <TransformOutput
              result={data.output_json}
              plainText={data.output_plain_text}
              originalText={""} // Compare tab won't render original text in history if not stored, which is expected by data retention policy
              onReset={() => navigate('/transform')}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
