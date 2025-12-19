import { X, BookOpen, Users, Calendar, ClipboardList, AlertCircle, FileText, FolderOpen, Tent } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  const sections = [
    {
      title: 'Dashboard Overzicht',
      icon: Tent,
      content: 'Het dashboard geeft een overzicht van de huidige bezetting, reserveringen en belangrijke statistieken. Gebruik de navigatie tabs bovenaan om tussen verschillende modules te wisselen.'
    },
    {
      title: 'Reserveringen Beheren',
      icon: Calendar,
      content: 'In de Reserveringen tab kun je alle boekingen bekijken, zoeken en filteren. Gebruik de filter knop om te sorteren op plaats, check-in datum of aantal gasten. Klik op "Nieuwe Reservering" voor snelle acties.'
    },
    {
      title: 'Taken & Activiteiten',
      icon: ClipboardList,
      content: 'Beheer dagelijkse taken in de Taken tab. Voeg nieuwe taken toe, wijs ze toe aan medewerkers en vink ze af wanneer voltooid. In Evenementen kun je campingactiviteiten plannen en deelnemers beheren.'
    },
    {
      title: 'Ziekte/Verzuim',
      icon: AlertCircle,
      content: 'Meld ziekte in de Ziekte/Verzuim tab. Medewerkers kunnen hun eigen ziekte aangeven en managers kunnen alle ziekmeldingen inzien. Actieve en verlopen meldingen worden gescheiden weergegeven.'
    },
    {
      title: 'File Sharing & Samenwerking',
      icon: FolderOpen,
      content: 'Deel bestanden met je team via de File Sharing module. Upload documenten, verzend berichten en werk efficiënt samen. Alle teamleden hebben realtime toegang tot gedeelde bestanden.'
    },
    {
      title: 'Rollen & Toegang',
      icon: Users,
      content: 'Het systeem ondersteunt verschillende gebruikersrollen (Beheerder, Manager, Medewerker) met specifieke toegangsrechten. Beheerders hebben volledige toegang, medewerkers zien alleen relevante informatie.'
    },
    {
      title: 'Administratie',
      icon: FileText,
      content: 'De Administratie module is bedoeld voor financiële administratie, rapporten en documenten. Hier kun je facturen, betalingen en andere administratieve taken beheren.'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-green-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            <div>
              <h2 className="text-white">Dashboard Handleiding</h2>
              <p className="text-green-100 text-sm">Het Digital Erf - Camping Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-green-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-5 hover:border-green-700 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 mb-2">{section.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tips Section */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-5">
            <h3 className="text-gray-900 mb-3">💡 Handige Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Gebruik de zoekfunctie om snel reserveringen te vinden</li>
              <li>• Wijs taken toe aan specifieke medewerkers voor duidelijke verantwoordelijkheden</li>
              <li>• Check dagelijks de actieve ziekmeldingen voor personeelsplanning</li>
              <li>• Filter reserveringen op check-in datum om aankomende gasten voor te bereiden</li>
              <li>• Gebruik File Sharing om belangrijke documenten centraal te bewaren</li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Meer hulp nodig? Neem contact op met de systeembeheerder.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
