import { CookiePreferences } from './components/CookiePreferences';
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { dealershipStore, DealershipState } from './services/dealershipStore';
import { Motorcycle } from './types';
import { UserProfile } from './lib/rbac';
import { Navbar } from './components/Navbar';
import { GroundedChatbot } from './components/GroundedChatbot';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Seo } from './components/Seo';
import { ShowroomHome } from './views/ShowroomHome';

// Lazy-load staff/admin/legal surfaces & the bike detail route to keep the
// public showroom bundle lean on mobile networks.
const BikeDetailPage = React.lazy(() => import('./views/BikeDetailPage').then((m) => ({ default: m.BikeDetailPage })));
const NotFound = React.lazy(() => import('./views/NotFound').then((m) => ({ default: m.NotFound })));
const LegalPagesView = React.lazy(() => import('./components/LegalPagesView').then((m) => ({ default: m.LegalPagesView })));
const LegalPagesModal = React.lazy(() => import('./components/LegalPagesModal').then((m) => ({ default: m.LegalPagesModal })));
const LeadCaptureModal = React.lazy(() => import('./components/LeadCaptureModal').then((m) => ({ default: m.LeadCaptureModal })));
const CsvUploadModal = React.lazy(() => import('./components/CsvUploadModal').then((m) => ({ default: m.CsvUploadModal })));
const BikeDetailModal = React.lazy(() => import('./components/BikeDetailModal').then((m) => ({ default: m.BikeDetailModal })));
const BikeZoomSpecsModal = React.lazy(() => import('./components/BikeZoomSpecsModal').then((m) => ({ default: m.BikeZoomSpecsModal })));
const TestRideModal = React.lazy(() => import('./components/TestRideModal').then((m) => ({ default: m.TestRideModal })));
const CartDrawer = React.lazy(() => import('./components/CartDrawer').then((m) => ({ default: m.CartDrawer })));
const BikeCompareModal = React.lazy(() => import('./components/BikeCompareModal').then((m) => ({ default: m.BikeCompareModal })));
const OlxPostingModal = React.lazy(() => import('./components/OlxPostingModal').then((m) => ({ default: m.OlxPostingModal })));
const StaffLoginPage = React.lazy(() => import('./components/StaffLoginPage').then((m) => ({ default: m.StaffLoginPage })));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const StaffPortal = React.lazy(() => import('./components/StaffPortal').then((m) => ({ default: m.StaffPortal })));

const RouteFallback: React.FC = () => (
  <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-amber-500" />
    <span className="sr-only">Loading…</span>
  </div>
);

type AppView = 'showroom' | 'admin' | 'staff' | 'login' | 'legal';

const viewFromPath = (pathname: string): AppView => {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/staff')) return 'staff';
  if (pathname.startsWith('/login')) return 'login';
  if (['/legal', '/privacy-policy', '/terms-and-conditions'].includes(pathname)) return 'legal';
  return 'showroom';
};

const pathFromView = (view: AppView): string => {
  switch (view) {
    case 'admin': return '/admin';
    case 'staff': return '/staff';
    case 'login': return '/login';
    case 'legal': return '/legal';
    default: return '/';
  }
};

const LegalRoute: React.FC<{ onBackToShowroom: () => void; page?: 'privacy' | 'terms' }> = ({ onBackToShowroom, page }) => {
  const [searchParams] = useSearchParams();
  const tab = page ?? (searchParams.get('tab') === 'terms' ? 'terms' : 'privacy');
  return (
    <>
      <Seo
        title={tab === 'privacy' ? 'Privacy Policy | The Bike Yard' : 'Terms & Conditions | The Bike Yard'}
        description="The Bike Yard privacy notice and dealership terms for the Khopat showroom demo."
        path={tab === 'privacy' ? '/privacy-policy' : '/terms-and-conditions'}
      />
      <LegalPagesView initialTab={tab} onBackToShowroom={onBackToShowroom} />
    </>
  );
};

export default function App() {
  return <CookiePreferences><ShowroomApp /></CookiePreferences>;
}

function ShowroomApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeView = viewFromPath(location.pathname);

  const [state, setState] = useState<DealershipState>(dealershipStore.getState());
  const [isLeadModalOpen, setIsLeadModalOpen] = useState<boolean>(false);
  const [leadTargetBike, setLeadTargetBike] = useState<Motorcycle | null>(null);

  // Authentication State for Staff & Dealership Management (session-persisted)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const raw = sessionStorage.getItem('tby-staff-session');
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (currentUser) sessionStorage.setItem('tby-staff-session', JSON.stringify(currentUser));
      else sessionStorage.removeItem('tby-staff-session');
    } catch {
      /* sessionStorage unavailable — non-fatal */
    }
  }, [currentUser]);

  // Vehicle Selection & Modal States
  const [selectedBike, setSelectedBike] = useState<Motorcycle | null>(state.bikes[0] || null);
  const [detailBike, setDetailBike] = useState<Motorcycle | null>(null);
  const [openBookingForm, setOpenBookingForm] = useState(false);
  const [zoomBike, setZoomBike] = useState<Motorcycle | null>(null);
  const [testRideBike, setTestRideBike] = useState<Motorcycle | null>(null);
  const [olxTargetBike, setOlxTargetBike] = useState<Motorcycle | null>(null);

  // UI Modal Toggles
  const [isTestRideOpen, setIsTestRideOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms'>('privacy');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);
  const [isOlxModalOpen, setIsOlxModalOpen] = useState<boolean>(false);

  // Compare State
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [compareBikeIds, setCompareBikeIds] = useState<string[]>([]);
  const [compareBikeA, setCompareBikeA] = useState<Motorcycle | null>(null);
  const [compareBikeB, setCompareBikeB] = useState<Motorcycle | null>(null);

  // Scroll to top on route change; honour #hash anchors
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname, location.hash]);

  const handleToggleCompareBike = (bike: Motorcycle) => {
    if (compareBikeIds.includes(bike.id)) {
      setCompareBikeIds(compareBikeIds.filter((id) => id !== bike.id));
      return;
    }

    const updated = compareBikeIds.length >= 2 ? [compareBikeIds[0]!, bike.id] : [...compareBikeIds, bike.id];
    setCompareBikeIds(updated);
    if (updated.length === 2) {
      setCompareBikeA(state.bikes.find((candidate) => candidate.id === updated[0]) ?? null);
      setCompareBikeB(bike);
      setIsCompareOpen(true);
    }
  };

  const handleOpenCompare = (bikeA?: Motorcycle, bikeB?: Motorcycle) => {
    if (bikeA) setCompareBikeA(bikeA);
    if (bikeB) setCompareBikeB(bikeB);

    if (!bikeA && !bikeB) {
      if (compareBikeIds.length >= 2) {
        const bA = state.bikes.find((b) => b.id === compareBikeIds[0]) || null;
        const bB = state.bikes.find((b) => b.id === compareBikeIds[1]) || null;
        setCompareBikeA(bA);
        setCompareBikeB(bB);
      } else if (compareBikeIds.length === 1) {
        const bA = state.bikes.find((b) => b.id === compareBikeIds[0]) || null;
        const bB = state.bikes.find((b) => b.id !== compareBikeIds[0]) || null;
        setCompareBikeA(bA);
        setCompareBikeB(bB);
      } else {
        setCompareBikeA(state.bikes[0] || null);
        setCompareBikeB(state.bikes[1] || state.bikes[0] || null);
      }
    }
    setIsCompareOpen(true);
  };

  // Subscribe to real-time store updates
  useEffect(() => {
    const unsubscribe = dealershipStore.subscribe(() => {
      const freshState = { ...dealershipStore.getState() };
      setState(freshState);
      if (selectedBike) {
        const updated = freshState.bikes.find((b) => b.id === selectedBike.id);
        if (updated) setSelectedBike(updated);
      }
    });
    return () => unsubscribe();
  }, [selectedBike?.id]);

  const totalInStock = state.stockUnits.filter((u) => u.status === 'IN_STOCK').length;
  const newBikes = state.bikes.filter((b) => !b.isUsed);
  const usedBikes = state.bikes.filter((b) => b.isUsed);

  const handleStaffLogin = (user: UserProfile) => {
    setCurrentUser(user);
    navigate(user.role === 'SALES_EXEC' || user.role === 'RTO_STAFF' ? '/staff' : '/admin');
  };

  const handleStaffLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  const handleViewChange = (v: AppView) => {
    if ((v === 'admin' || v === 'staff') && !currentUser) {
      navigate('/login');
      return;
    }
    navigate(pathFromView(v));
  };

  const currentActiveBike = selectedBike || state.bikes[0] || null;

  const openTestRide = (bike: Motorcycle | null) => {
    if (bike) setTestRideBike(bike);
    setIsTestRideOpen(true);
  };

  const openEnquire = (bike: Motorcycle) => {
    setLeadTargetBike(bike);
    setIsLeadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/20 selection:text-amber-400">
      <div role="status" className="bg-amber-500 px-4 py-2 text-center text-xs font-semibold text-slate-950">
        CLIENT PREVIEW — Sample inventory, prices, staff personas and transactions are illustrative only. No real payments, bookings or regulatory submissions are processed.
      </div>
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        onViewChange={handleViewChange}
        onOpenTestRideModal={() => openTestRide(currentActiveBike)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLeadModal={() => {
          setLeadTargetBike(currentActiveBike);
          setIsLeadModalOpen(true);
        }}
        onOpenCompare={() => handleOpenCompare()}
        compareCount={compareBikeIds.length}
        onOpenCsvUpload={currentUser ? () => setIsCsvModalOpen(true) : undefined}
        currentUser={currentUser}
        onLogout={handleStaffLogout}
      />

      {/* Main Body */}
      <main className="flex-1">
        <React.Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route
            path="/"
            element={
              <ShowroomHome
                state={state}
                totalInStock={totalInStock}
                newBikes={newBikes}
                usedBikes={usedBikes}
                currentUser={currentUser}
                currentActiveBike={currentActiveBike}
                selectedBikeId={selectedBike?.id}
                compareBikeIds={compareBikeIds}
                onSelectBike={(b) => setSelectedBike(b)}
                onBookTestRide={openTestRide}
                onZoomBike={(b) => setZoomBike(b)}
                onBookNow={(b) => setDetailBike(b)}
                onOpenCsvUpload={() => setIsCsvModalOpen(true)}
                onOpenOlxModal={(b) => {
                  setOlxTargetBike(b);
                  setIsOlxModalOpen(true);
                }}
                onOpenCompare={() => handleOpenCompare()}
                onToggleCompareBike={handleToggleCompareBike}
                onClearCompare={() => {
                  setCompareBikeIds([]);
                  setCompareBikeA(null);
                  setCompareBikeB(null);
                }}
              />
            }
          />
          <Route
            path="/bike/:bikeId"
            element={
              <BikeDetailPage
                bikes={state.bikes}
                dealershipInfo={state.dealershipInfo}
                onEnquire={openEnquire}
                onBookTestRide={openTestRide}
                onBookNow={(b) => {
                  setOpenBookingForm(true);
                  setDetailBike(b);
                }}
              />
            }
          />
          <Route
            path="/login"
            element={
              <>
                <Seo title="Staff Login | The Bike Yard" description="Authorised staff sign-in for The Bike Yard dealership management." path="/login" noIndex />
                <StaffLoginPage
                  onLoginSuccess={handleStaffLogin}
                  onBackToShowroom={() => navigate('/')}
                />
              </>
            }
          />
          <Route
            path="/admin"
            element={
              currentUser ? (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
                  <Seo title="Admin Dashboard | The Bike Yard" description="Authorised dealership administration — inventory, sales, invoices, refunds, pricing and offers." path="/admin" noIndex />
                  <AdminDashboard
                    state={state}
                    onOpenCsvUpload={() => setIsCsvModalOpen(true)}
                    onOpenOlxModal={(b) => {
                      setOlxTargetBike(b || usedBikes[0] || null);
                      setIsOlxModalOpen(true);
                    }}
                    currentUser={currentUser}
                    onLogout={handleStaffLogout}
                  />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/staff"
            element={
              currentUser ? (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
                  <Seo title="Staff Operations | The Bike Yard" description="Authorised staff operations portal — leads, test rides and delivery workflow." path="/staff" noIndex />
                  <StaffPortal
                    state={state}
                    onOpenCsvUpload={() => setIsCsvModalOpen(true)}
                    onOpenOlxModal={(b) => {
                      setOlxTargetBike(b || usedBikes[0] || null);
                      setIsOlxModalOpen(true);
                    }}
                    currentUser={currentUser}
                    onLogout={handleStaffLogout}
                  />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/legal" element={<LegalRoute onBackToShowroom={() => navigate('/')} />} />
          <Route path="/privacy-policy" element={<LegalRoute key="privacy" page="privacy" onBackToShowroom={() => navigate('/')} />} />
          <Route path="/terms-and-conditions" element={<LegalRoute key="terms" page="terms" onBackToShowroom={() => navigate('/')} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </React.Suspense>
      </main>

      {/* MODALS & LIGHTBOXES */}
      <React.Suspense fallback={null}>

      {/* Priority Callback & On-Road Quote Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        selectedBike={leadTargetBike || selectedBike}
        bikes={state.bikes}
      />

      {/* 360° Zoom & Multi-Tab Technical Specifications Lightbox */}
      {zoomBike && (
        <BikeZoomSpecsModal
          bike={zoomBike}
          onClose={() => setZoomBike(null)}
          onBookTestRide={(b) => {
            setZoomBike(null);
            openTestRide(b);
          }}
          onInstantBooking={(b) => {
            setZoomBike(null);
            setDetailBike(b);
          }}
        />
      )}

      {/* Bike Details & Booking Modal */}
      {detailBike && (
        <BikeDetailModal
          bike={detailBike}
          initialBookingForm={openBookingForm}
          onClose={() => {
            setOpenBookingForm(false);
            setDetailBike(null);
          }}
          onOpenTestRide={(b) => {
            setOpenBookingForm(false);
            setDetailBike(null);
            openTestRide(b);
          }}
        />
      )}

      {/* Test Ride Scheduler */}
      {isTestRideOpen && (
        <TestRideModal
          bike={testRideBike || currentActiveBike}
          bikes={state.bikes}
          onClose={() => setIsTestRideOpen(false)}
        />
      )}

      {/* Grounded Anti-Hallucination AI Showroom Desk */}
      <GroundedChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Shopping / Booking Advance Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Privacy Policy & Terms Legal Modal */}
      <LegalPagesModal
        isOpen={isLegalModalOpen}
        initialTab={legalModalTab}
        onClose={() => setIsLegalModalOpen(false)}
      />

      {/* Backend Staff CSV Upload & 1,000+ Variants Sync Modal */}
      {currentUser && (
        <CsvUploadModal
          isOpen={isCsvModalOpen}
          onClose={() => setIsCsvModalOpen(false)}
          staffName={currentUser.name || 'Staff Operations'}
        />
      )}

      {/* Side-by-Side Motorcycle Specification Comparison Modal */}
      {isCompareOpen && state.bikes.length > 0 && (
        <BikeCompareModal
          onClose={() => setIsCompareOpen(false)}
          bikes={state.bikes}
          initialBikeA={compareBikeA}
          initialBikeB={compareBikeB}
          onBookBike={(b) => {
            setIsCompareOpen(false);
            setDetailBike(b);
          }}
          onTestRideBike={(b) => {
            setIsCompareOpen(false);
            openTestRide(b);
          }}
        />
      )}

      {/* OLX India 1-Click Second-Hand Bike Ad Publisher Modal */}
      <OlxPostingModal
        isOpen={isOlxModalOpen}
        bike={olxTargetBike}
        availableBikes={state.bikes}
        staffName={currentUser?.name || 'Suraj Patil (Sales Exec)'}
        onClose={() => setIsOlxModalOpen(false)}
      />
      </React.Suspense>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeView={activeView}
        onViewChange={handleViewChange}
        onOpenTestRideModal={() => openTestRide(currentActiveBike)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
      />

      {/* Dealership Footer with Legal Privacy/Terms Triggers */}
      <Footer
        onOpenTestRideModal={() => openTestRide(currentActiveBike)}
        onOpenPrivacyModal={() => {
          setLegalModalTab('privacy');
          setIsLegalModalOpen(true);
        }}
        onOpenTermsModal={() => {
          setLegalModalTab('terms');
          setIsLegalModalOpen(true);
        }}
        onNavigateToLegal={(tab) => navigate(tab === 'privacy' ? '/privacy-policy' : '/terms-and-conditions')}
      />

      {/* Persistent WhatsApp enquiry shortcut (all pages) */}
      <FloatingWhatsApp phone={state.dealershipInfo.phone} />
    </div>
  );
}
