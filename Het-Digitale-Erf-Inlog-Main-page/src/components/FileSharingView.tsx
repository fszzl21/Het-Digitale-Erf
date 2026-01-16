import { FolderOpen, ExternalLink } from 'lucide-react';

export function FileSharingView() {
  const handleOpenCloud = () => {
    window.open('https://cloud.digitale-erf.xyz', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-100 dark:border-border p-12">
      <div className="text-center max-w-md mx-auto">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
          <FolderOpen className="w-10 h-10 text-green-700 dark:text-green-400" />
        </div>
        <h2 className="text-gray-900 dark:text-foreground mb-3">File Sharing</h2>
        <p className="text-gray-600 dark:text-muted-foreground mb-8">
          Toegang tot de cloud omgeving waar u bestanden kunt delen en beheren met uw team.
        </p>
        <button
          onClick={handleOpenCloud}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
        >
          <span>Openen in Cloud</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
