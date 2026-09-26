import React, { useState } from 'react';
import { MarketProvider, useMarket } from './context/MarketContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { CategoriesView } from './components/CategoriesView';
import { SellView } from './components/SellView';
import { ChatView } from './components/ChatView';
import { ProfileView } from './components/ProfileView';
import { AdminView } from './components/AdminView';
import { OrdersView } from './components/OrdersView';
import { SearchResultsView } from './components/SearchResultsView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { OrderModal } from './components/OrderModal';
import { InstitutionsModal } from './components/InstitutionsModal';
import { SearchFilterModal } from './components/SearchFilterModal';
import { SafetyCenterModal } from './components/SafetyCenterModal';
import { ReportListingModal } from './components/ReportListingModal';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { VerificationModal } from './components/VerificationModal';
import { ReviewModal } from './components/ReviewModal';
import { PromoteModal } from './components/PromoteModal';
import { ReceiptModal } from './components/ReceiptModal';
import { SellerProfileModal } from './components/SellerProfileModal';
import { NotificationsModal } from './components/NotificationsModal';
import { LegalDocsModal } from './components/LegalDocsModal';
import { AccountDeletionModal } from './components/AccountDeletionModal';
import { Product } from './types';

const MainLayout: React.FC = () => {
  const { 
    activeTab, 
    viewProductDetail, 
    setViewProductDetail, 
    toastMessage, 
    setSelectedCategory, 
    setSelectedSchoolFilter,
    allUsers,
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    checkoutTargetProduct,
    isVerificationModalOpen,
    setIsVerificationModalOpen,
    isReviewModalOpen,
    setIsReviewModalOpen,
    reviewTargetOrder,
    isPromoteModalOpen,
    setIsPromoteModalOpen,
    promoteTargetProduct,
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    receiptTargetReceipt,
    selectedSellerProfileId,
    closeSellerProfile,
    isNotificationsModalOpen,
    setIsNotificationsModalOpen,
    isLegalModalOpen,
    setIsLegalModalOpen,
    legalModalTab,
    setLegalModalTab,
    isAccountDeletionModalOpen,
    setIsAccountDeletionModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen
  } = useMarket();

  // Modal States
  const [isCampusModalOpen, setIsCampusModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Ordering & Reporting state
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);
  const [reportingProduct, setReportingProduct] = useState<Product | null>(null);

  // Advanced search filter state
  const [currentFilters, setCurrentFilters] = useState<{
    category: string;
    condition: 'All' | 'New' | 'Used';
    minPrice: string;
    maxPrice: string;
    sortBy: 'recent' | 'price_asc' | 'price_desc' | 'popular';
    school: string;
  }>({
    category: 'All',
    condition: 'All',
    minPrice: '',
    maxPrice: '',
    sortBy: 'recent',
    school: 'All',
  });

  const handleApplyAdvancedFilters = (filters: typeof currentFilters) => {
    setCurrentFilters(filters);
    setSelectedCategory(filters.category);
    setSelectedSchoolFilter(filters.school);
  };

  const selectedSeller = allUsers.find(u => u.id === selectedSellerProfileId);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          id="global-toast"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-60 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl border border-slate-700/80 backdrop-blur-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-150 max-w-[90vw] text-center"
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        onOpenCampusModal={() => setIsCampusModalOpen(true)}
        onOpenSafetyModal={() => setIsSafetyModalOpen(true)}
        onOpenFilterModal={() => setIsFilterModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto">
        {activeTab === 'home' && (
          <HomeView
            onOpenCampusModal={() => setIsCampusModalOpen(true)}
            onOpenSafetyModal={() => setIsSafetyModalOpen(true)}
            onOpenFilterModal={() => setIsFilterModalOpen(true)}
          />
        )}

        {activeTab === 'categories' && <CategoriesView />}

        {activeTab === 'search' && <SearchResultsView />}

        {activeTab === 'sell' && <SellView />}

        {activeTab === 'orders' && (
          <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
            <OrdersView />
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6 pb-24">
            <ChatView />
          </div>
        )}

        {activeTab === 'profile' && (
          <ProfileView
            onOpenCampusModal={() => setIsCampusModalOpen(true)}
            onOpenSafetyModal={() => setIsSafetyModalOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'admin' && <AdminView />}
      </main>

      {/* Bottom Navigation for Mobile & Quick Access */}
      <BottomNav />

      {/* Global Modals */}

      {/* 1. Product Detail Modal */}
      {viewProductDetail && (
        <ProductDetailModal
          product={viewProductDetail}
          onClose={() => setViewProductDetail(null)}
          onOpenReportModal={(prod) => {
            setReportingProduct(prod);
          }}
          onOpenOrderModal={(prod) => {
            setOrderProduct(prod);
          }}
        />
      )}

      {/* 2. Order / Meetup Quick Modal (Traditional) */}
      {orderProduct && (
        <OrderModal
          product={orderProduct}
          onClose={() => setOrderProduct(null)}
        />
      )}

      {/* 3. Paystack Checkout Modal (Full Checkout Flow) */}
      {isCheckoutModalOpen && checkoutTargetProduct && (
        <CheckoutModal
          product={checkoutTargetProduct}
          onClose={() => setIsCheckoutModalOpen(false)}
        />
      )}

      {/* 4. Student ID Verification Modal */}
      {isVerificationModalOpen && (
        <VerificationModal
          onClose={() => setIsVerificationModalOpen(false)}
        />
      )}

      {/* 5. Rating & Review Modal */}
      {isReviewModalOpen && reviewTargetOrder && (
        <ReviewModal
          order={reviewTargetOrder}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}

      {/* 6. Listing Promotion / Spotlight Modal */}
      {isPromoteModalOpen && promoteTargetProduct && (
        <PromoteModal
          product={promoteTargetProduct}
          onClose={() => setIsPromoteModalOpen(false)}
        />
      )}

      {/* 7. Official Order & Payment Receipt Modal */}
      {isReceiptModalOpen && receiptTargetReceipt && (
        <ReceiptModal
          receipt={receiptTargetReceipt}
          onClose={() => setIsReceiptModalOpen(false)}
        />
      )}

      {/* 8. Public Campus Seller Profile & Review Storefront */}
      {selectedSellerProfileId && selectedSeller && (
        <SellerProfileModal
          seller={selectedSeller}
          onClose={closeSellerProfile}
          onSelectProduct={(prod) => {
            closeSellerProfile();
            setViewProductDetail(prod);
          }}
        />
      )}

      {/* 9. Campus Activity & Notifications Center */}
      {isNotificationsModalOpen && (
        <NotificationsModal
          onClose={() => setIsNotificationsModalOpen(false)}
        />
      )}

      {/* 10. Report Listing Modal */}
      {reportingProduct && (
        <ReportListingModal
          product={reportingProduct}
          onClose={() => setReportingProduct(null)}
        />
      )}

      {/* 11. Campus / Institution Modal */}
      <InstitutionsModal
        isOpen={isCampusModalOpen}
        onClose={() => setIsCampusModalOpen(false)}
      />

      {/* 12. Advanced Search & Filter Modal */}
      <SearchFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyAdvancedFilters}
        currentFilters={currentFilters}
      />

      {/* 13. Campus Safety Guidelines Modal */}
      <SafetyCenterModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
      />

      {/* 14. Student Auth / Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* 15. Compliance Legal Documents Modal (Privacy, Terms, Safety, Refunds) */}
      <LegalDocsModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
        onTabChange={(tab) => setLegalModalTab(tab)}
      />

      {/* 16. Account Deletion & Right to be Forgotten Modal */}
      <AccountDeletionModal
        isOpen={isAccountDeletionModalOpen}
        onClose={() => setIsAccountDeletionModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <MarketProvider>
      <MainLayout />
    </MarketProvider>
  );
}
