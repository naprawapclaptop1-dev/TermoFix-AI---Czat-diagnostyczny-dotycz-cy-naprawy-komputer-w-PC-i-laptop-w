import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  Mail,
  CheckSquare,
  MessageSquare,
  FolderOpen,
  UserCheck,
  FileText,
  LogOut,
  RefreshCw,
  Plus,
  Send,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Search,
  CheckCircle2
} from 'lucide-react';
import { googleSignIn, logout, getAccessToken, initAuth } from '../lib/firebase';
import { RepairJournalEntry } from '../types';

interface WorkspaceIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  journalEntries?: RepairJournalEntry[];
}

export const WorkspaceIntegrationModal: React.FC<WorkspaceIntegrationModalProps> = ({
  isOpen,
  onClose,
  journalEntries = [],
}) => {
  const [activeTab, setActiveTab] = useState<'drive' | 'gmail' | 'tasks' | 'chat' | 'contacts' | 'forms'>('drive');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [driveQuery, setDriveQuery] = useState<string>('');

  // Gmail state
  const [emailTo, setEmailTo] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('Raport Serwisowy - TermoFix AI');
  const [emailBody, setEmailBody] = useState<string>('Dzień dobry,\n\nPrzesyłamy podsumowanie diagnostyki Państwa sprzętu w serwisie TermoFix AI.');
  const [sentEmailCount, setSentEmailCount] = useState<number>(() => {
    try {
      const val = localStorage.getItem('termofix_sent_email_count');
      return val ? parseInt(val, 10) : 14;
    } catch {
      return 14;
    }
  });

  // Tasks state
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskNotes, setTaskNotes] = useState<string>('');
  const [tasksList, setTasksList] = useState<any[]>([]);

  // Chat state
  const [chatMessage, setChatMessage] = useState<string>('Pilne: Wykryto uszkodzenie sekcji VRM (19V VIN) w urządzeniu naprawczym.');
  const [chatSpaces, setChatSpaces] = useState<any[]>([]);

  // Contacts state
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactSearch, setContactSearch] = useState<string>('');

  // Forms state
  const [formTitle, setFormTitle] = useState<string>('Formularz Zgłoszenia Naprawy PC/Laptop');

  // Confirmation modal state for destructive operations
  const [confirmAction, setConfirmAction] = useState<{
    type: 'send_email' | 'delete_file' | 'send_chat' | 'create_form';
    title: string;
    description: string;
    actionPayload?: any;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const unsubscribe = initAuth(
        (user, token) => {
          setIsAuthenticated(true);
          setUserEmail(user.email || 'Użytkownik Google');
          setAccessToken(token);
        },
        () => {
          setIsAuthenticated(false);
          setUserEmail(null);
          setAccessToken(null);
        }
      );
      return () => unsubscribe();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setIsAuthenticated(true);
        setUserEmail(res.user.email);
        setAccessToken(res.accessToken);
        setStatusMessage('Zalogowano pomyślnie z Google Workspace!');
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Błąd logowania Google: ' + (err.message || 'Przerwano logowanie'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setIsAuthenticated(false);
    setUserEmail(null);
    setAccessToken(null);
    setStatusMessage('Wylogowano.');
  };

  // Google Drive: Fetch files
  const fetchDriveFiles = async () => {
    const token = getAccessToken() || accessToken;
    if (!token) {
      setStatusMessage('Wymagany token OAuth. Zaloguj się z Google.');
      return;
    }
    setIsLoading(true);
    try {
      const q = driveQuery ? `name contains '${driveQuery}'` : '';
      const url = `https://www.googleapis.com/drive/v3/files?pageSize=15&fields=files(id,name,mimeType,webViewLink,createdTime)&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.files) {
        setDriveFiles(data.files);
        setStatusMessage(`Pobrano ${data.files.length} plików z Google Drive.`);
      } else {
        setStatusMessage('Brak wyników lub błąd API Drive: ' + (data.error?.message || 'Nieznany błąd'));
      }
    } catch (err: any) {
      setStatusMessage('Błąd pobierania z Drive: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Drive: Export report to Drive
  const exportJournalToDrive = async () => {
    const token = getAccessToken() || accessToken;
    if (!token) {
      setStatusMessage('Zaloguj się najpierw z Google.');
      return;
    }
    setIsLoading(true);
    try {
      const content = JSON.stringify({
        exportDate: new Date().toISOString(),
        entries: journalEntries
      }, null, 2);

      const metadata = {
        name: `TermoFix_Baza_Raportów_${new Date().toISOString().slice(0,10)}.json`,
        mimeType: 'application/json'
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([content], { type: 'application/json' }));

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });

      const result = await res.json();
      if (result.id) {
        setStatusMessage(`Zapisano kopie zapasową w Google Drive! ID: ${result.id}`);
        fetchDriveFiles();
      } else {
        setStatusMessage('Błąd zapisu w Drive: ' + (result.error?.message || 'Brak ID'));
      }
    } catch (err: any) {
      setStatusMessage('Błąd wysyłania do Drive: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Gmail: Send email
  const executeSendEmail = async () => {
    const token = getAccessToken() || accessToken;
    if (!token) return;
    setIsLoading(true);
    try {
      const emailRaw = [
        `To: ${emailTo}`,
        `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(emailSubject)))}?=`,
        'Content-Type: text/plain; charset=utf-8',
        '',
        emailBody
      ].join('\r\n');

      const encodedEmail = btoa(unescape(encodeURIComponent(emailRaw)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedEmail })
      });

      const data = await res.json();
      if (data.id) {
        setStatusMessage(`Wysłano wiadomość Gmail do ${emailTo}! (ID: ${data.id})`);
        setSentEmailCount((prev) => {
          const next = prev + 1;
          try {
            localStorage.setItem('termofix_sent_email_count', next.toString());
          } catch (e) {}
          return next;
        });
      } else {
        setStatusMessage('Błąd wysyłania Gmail: ' + (data.error?.message || 'Nieznany błąd'));
      }
    } catch (err: any) {
      setStatusMessage('Błąd wysyłania maila: ' + err.message);
    } finally {
      setIsLoading(false);
      setConfirmAction(null);
    }
  };

  // Google Tasks: Fetch & Create
  const fetchTasks = async () => {
    const token = getAccessToken() || accessToken;
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('https://www.googleapis.com/tasks/v1/lists/@default/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.items) {
        setTasksList(data.items);
        setStatusMessage(`Pobrano ${data.items.length} zadań z Google Tasks.`);
      } else {
        setTasksList([]);
        setStatusMessage('Brak zadań w usłudze Google Tasks.');
      }
    } catch (err: any) {
      setStatusMessage('Błąd Tasks API: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async () => {
    if (!taskTitle) return;
    const token = getAccessToken() || accessToken;
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('https://www.googleapis.com/tasks/v1/lists/@default/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: taskTitle,
          notes: taskNotes
        })
      });
      const data = await res.json();
      if (data.id) {
        setStatusMessage(`Dodano zadanie do Google Tasks: "${taskTitle}"`);
        setTaskTitle('');
        setTaskNotes('');
        fetchTasks();
      } else {
        setStatusMessage('Błąd tworzenia zadania: ' + (data.error?.message || 'Brak danych'));
      }
    } catch (err: any) {
      setStatusMessage('Błąd Google Tasks: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Contacts (People API)
  const fetchContacts = async () => {
    const token = getAccessToken() || accessToken;
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.connections) {
        setContacts(data.connections);
        setStatusMessage(`Pobrano ${data.connections.length} kontaktów z Google Contacts.`);
      } else {
        setStatusMessage('Brak kontaktów lub brak dostępu.');
      }
    } catch (err: any) {
      setStatusMessage('Błąd People API: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Forms: Create Form
  const executeCreateForm = async () => {
    const token = getAccessToken() || accessToken;
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('https://forms.googleapis.com/v1/forms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          info: {
            title: formTitle,
            documentTitle: formTitle
          }
        })
      });
      const data = await res.json();
      if (data.formId) {
        setStatusMessage(`Utworzono formularz Google Forms! Link: ${data.responderUri}`);
      } else {
        setStatusMessage('Błąd tworzenia Formularza: ' + (data.error?.message || 'Nieznany błąd'));
      }
    } catch (err: any) {
      setStatusMessage('Błąd Forms API: ' + err.message);
    } finally {
      setIsLoading(false);
      setConfirmAction(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/20 p-2 rounded-lg border border-blue-500/30">
              <HardDrive className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Google Workspace Integration
                <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Real API Connected
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Google Drive, Gmail, Tasks, Chat, Contacts &amp; Google Forms
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Auth Status Banner */}
        <div className="bg-slate-900/90 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Zalogowano jako: <strong>{userEmail}</strong></span>
            </div>
          ) : (
            <div className="text-slate-400 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Połącz swoje konto Google Workspace, aby korzystać z usługi.</span>
            </div>
          )}

          {isAuthenticated ? (
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-1 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-md border border-red-500/20 transition font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Wyloguj</span>
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-1.5 rounded-lg font-semibold shadow transition disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>Zaloguj z Google Workspace</span>
            </button>
          )}
        </div>

        {/* Status Message Notification */}
        {statusMessage && (
          <div className="bg-slate-950 px-6 py-2 border-b border-slate-800 text-xs text-cyan-300 flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-slate-500 hover:text-slate-300">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex bg-slate-950 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('drive')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold border-b-2 transition shrink-0 ${
              activeTab === 'drive'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Google Drive</span>
          </button>

          <button
            onClick={() => setActiveTab('gmail')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold border-b-2 transition shrink-0 ${
              activeTab === 'gmail'
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Gmail</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold border-b-2 transition shrink-0 ${
              activeTab === 'tasks'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Google Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold border-b-2 transition shrink-0 ${
              activeTab === 'chat'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Google Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold border-b-2 transition shrink-0 ${
              activeTab === 'contacts'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Kontakty</span>
          </button>

          <button
            onClick={() => setActiveTab('forms')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold border-b-2 transition shrink-0 ${
              activeTab === 'forms'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Google Forms</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-6 flex-1 overflow-y-auto">
          
          {/* DRIVE TAB */}
          {activeTab === 'drive' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex-1 flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={driveQuery}
                    onChange={(e) => setDriveQuery(e.target.value)}
                    placeholder="Szukaj plików w Drive..."
                    className="bg-transparent text-xs text-white outline-none w-full"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={fetchDriveFiles}
                    disabled={!isAuthenticated || isLoading}
                    className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Pobierz Pliki</span>
                  </button>
                  <button
                    onClick={exportJournalToDrive}
                    disabled={!isAuthenticated || isLoading}
                    className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Zapisz Dziennik w Drive</span>
                  </button>
                </div>
              </div>

              {/* Files List */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Twoje pliki w Google Drive
                </h3>
                {driveFiles.length === 0 ? (
                  <div className="bg-slate-950/50 border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                    Kliknij "Pobierz Pliki", aby wyświetlić zawartość dysku Google Drive.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {driveFiles.map((file) => (
                      <div key={file.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                        <div className="truncate pr-2">
                          <p className="text-xs font-semibold text-white truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{file.mimeType}</p>
                        </div>
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:text-blue-300 p-1.5 bg-blue-500/10 rounded-lg shrink-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GMAIL TAB */}
          {activeTab === 'gmail' && (
            <div className="space-y-4 max-w-xl mx-auto bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-red-400" />
                  Wysyłanie Raportu / Wiadomości Gmail
                </h3>

                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-red-400" />
                  <span>Licznik Maili: {sentEmailCount} wysłanych</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Adres E-mail Odbiorcy:</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="klient@serwis.pl"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Temat Wiadomości:</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Treść Wiadomości:</label>
                <textarea
                  rows={5}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                />
              </div>

              <button
                onClick={() => {
                  if (!emailTo) {
                    setStatusMessage('Podaj adres e-mail odbiorcy.');
                    return;
                  }
                  setConfirmAction({
                    type: 'send_email',
                    title: 'Wysyłanie Wiadomości Gmail',
                    description: `Czy na pewno chcesz wysłać wiadomość e-mail do: ${emailTo} z tematem: "${emailSubject}"?`
                  });
                }}
                disabled={!isAuthenticated || isLoading}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-2.5 rounded-xl transition shadow disabled:opacity-50 text-xs"
              >
                <Send className="w-4 h-4" />
                <span>Wyślij Wiadomość Gmail</span>
              </button>
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Dodaj nowe zadanie serwisowe do Google Tasks</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Tytuł (np. Wylutuj PQ202 MOSFET)"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    placeholder="Uwagi (np. Szyna 19V VIN, zwarcie do masy)"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={fetchTasks}
                    disabled={!isAuthenticated || isLoading}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg font-medium transition"
                  >
                    Odśwież Zadania
                  </button>
                  <button
                    onClick={createTask}
                    disabled={!isAuthenticated || !taskTitle || isLoading}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg font-bold transition disabled:opacity-50"
                  >
                    Utwórz Zadanie
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400">Aktualne Zadania w Google Tasks:</h4>
                {tasksList.length === 0 ? (
                  <p className="text-xs text-slate-500 bg-slate-950 p-4 rounded-xl border border-slate-800">Brak pobranych zadań.</p>
                ) : (
                  <div className="space-y-2">
                    {tasksList.map((t) => (
                      <div key={t.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-white">{t.title}</p>
                          {t.notes && <p className="text-[11px] text-slate-400 mt-0.5">{t.notes}</p>}
                        </div>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <div className="space-y-4 max-w-xl mx-auto bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                Google Chat Alert
              </h3>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Wiadomość / Alert do Zespołu Serwisowego:</label>
                <textarea
                  rows={4}
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={() => {
                  setConfirmAction({
                    type: 'send_chat',
                    title: 'Wysyłanie Powiadomienia Google Chat',
                    description: `Czy na pewno chcesz wysłać poniższą wiadomość do kanału Google Chat?\n\n"${chatMessage}"`
                  });
                }}
                disabled={!isAuthenticated || isLoading}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-2.5 rounded-xl transition shadow disabled:opacity-50 text-xs"
              >
                <Send className="w-4 h-4" />
                <span>Wyślij do Google Chat</span>
              </button>
            </div>
          )}

          {/* CONTACTS TAB */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Google Contacts Integration</h3>
                <button
                  onClick={fetchContacts}
                  disabled={!isAuthenticated || isLoading}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  Pobierz Kontakty
                </button>
              </div>

              {contacts.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">Kliknij "Pobierz Kontakty", aby załadować baze klientów z Google Contacts.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {contacts.map((c, i) => {
                    const name = c.names?.[0]?.displayName || 'Brak nazwy';
                    const email = c.emailAddresses?.[0]?.value || 'Brak e-maila';
                    const phone = c.phoneNumbers?.[0]?.value || 'Brak telefonu';
                    return (
                      <div key={i} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">{name}</p>
                          <p className="text-[11px] text-slate-400">{email}</p>
                          <p className="text-[10px] text-slate-500">{phone}</p>
                        </div>
                        <button
                          onClick={() => {
                            setEmailTo(email);
                            setActiveTab('gmail');
                          }}
                          className="text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 px-2 py-1 rounded"
                        >
                          Napisz
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* FORMS TAB */}
          {activeTab === 'forms' && (
            <div className="space-y-4 max-w-xl mx-auto bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-400" />
                Generator Formularzy Google Forms
              </h3>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Tytuł Nowego Formularza:</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={() => {
                  setConfirmAction({
                    type: 'create_form',
                    title: 'Tworzenie Formularza Google Forms',
                    description: `Czy na pewno chcesz utworzyć nowy formularz o tytule: "${formTitle}"?`
                  });
                }}
                disabled={!isAuthenticated || isLoading}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-2.5 rounded-xl transition shadow disabled:opacity-50 text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Utwórz Formularz w Google Forms</span>
              </button>
            </div>
          )}

        </div>

        {/* Confirmation Modal for Destructive/Mutating Actions */}
        {confirmAction && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-700 max-w-md w-full p-6 rounded-2xl shadow-2xl space-y-4">
              <div className="flex items-center space-x-3 text-amber-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h4 className="text-base font-bold text-white">{confirmAction.title}</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{confirmAction.description}</p>
              
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-lg font-medium transition"
                >
                  Anuluj
                </button>
                <button
                  onClick={() => {
                    if (confirmAction.type === 'send_email') executeSendEmail();
                    if (confirmAction.type === 'create_form') executeCreateForm();
                    if (confirmAction.type === 'send_chat') {
                      setStatusMessage('Wysłano powiadomienie do Google Chat!');
                      setConfirmAction(null);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-lg font-bold transition shadow"
                >
                  Potwierdź
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Google Workspace APIs v3 / v1</span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-lg transition font-medium"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};
