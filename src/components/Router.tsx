import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import { rootRouteLoader, WixServicesProvider } from '@/wix-verticals/react-pages/react-router/routes/root';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { ProductDetailsRoute, productRouteLoader } from '@/wix-verticals/react-pages/react-router/routes/product-details';
import { StoreCollectionRoute, storeCollectionRouteLoader } from '@/wix-verticals/react-pages/react-router/routes/store-collection';
import { defaultStoreCollectionRouteRedirectLoader } from '@/wix-verticals/react-pages/react-router/routes/store-redirect';
import { Cart } from '@/wix-verticals/react-pages/react-router/routes/cart';
import { MemberProtectedRoute } from '@/components/ui/member-protected-route';

import Header from '@/components/layout/Header';
import PortalHeader from '@/components/layout/PortalHeader';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/CookieBanner';
import RoleSetup from '@/components/RoleSetup';
import HomePage from '@/components/pages/HomePage';
import AboutPage from '@/components/pages/AboutPage';
import BlogPage from '@/components/pages/BlogPage';
import BlogPostPage from '@/components/pages/BlogPostPage';
import ParQPage from '@/components/pages/ParQPage';
import CheckoutPage from '@/components/pages/CheckoutPage';
import PaymentSuccessPage from '@/components/pages/PaymentSuccessPage';
import OnlineTrainingPage from '@/components/pages/OnlineTrainingPage';
import PrivacyPage from '@/components/pages/PrivacyPage';
import TermsPage from '@/components/pages/TermsPage';
import DisclaimerPage from '@/components/pages/DisclaimerPage';
import AccessibilityPage from '@/components/pages/AccessibilityPage';
import CoachingPackages from '@/components/store/CoachingPackages';

// Client Portal Pages
import ClientPortalLayout from '@/components/pages/ClientPortal/ClientPortalLayout';
import DashboardPage from '@/components/pages/ClientPortal/DashboardPage';
import MyProgramPage from '@/components/pages/ClientPortal/MyProgramPage';
import NutritionPage from '@/components/pages/ClientPortal/NutritionPage';
import ProgressPage from '@/components/pages/ClientPortal/ProgressPage';
import BookingsPage from '@/components/pages/ClientPortal/BookingsPage';
import VideoLibraryPage from '@/components/pages/ClientPortal/VideoLibraryPage';
import MyVideoSubmissionsPage from '@/components/pages/ClientPortal/MyVideoSubmissionsPage';
import WorkoutHistoryPage from '@/components/pages/ClientPortal/WorkoutHistoryPage';

// Trainer Dashboard Pages
import TrainerDashboardLayout from '@/components/pages/TrainerDashboard/TrainerDashboardLayout';
import TrainerDashboardPage from '@/components/pages/TrainerDashboard/TrainerDashboardPage';
import TrainerClientsPage from '@/components/pages/TrainerDashboard/TrainerClientsPage';
import CreateProgramPage from '@/components/pages/TrainerDashboard/CreateProgramPage';
import VideoReviewsPage from '@/components/pages/TrainerDashboard/VideoReviewsPage';
import ClientProgressPage from '@/components/pages/TrainerDashboard/ClientProgressPage';
import AIAssistantPage from '@/components/pages/TrainerDashboard/AIAssistantPage';
import ProgramEditorPage from '@/components/pages/TrainerDashboard/ProgramEditorPage';
import ProgramEditorEnhanced from '@/components/pages/TrainerDashboard/ProgramEditorEnhanced';
import TrainerPreferencesPage from '@/components/pages/TrainerDashboard/TrainerPreferencesPage';
import WorkoutAssignmentPage from '@/components/pages/TrainerDashboard/WorkoutAssignmentPage';
import VideoLibraryManagementPage from '@/components/pages/TrainerDashboard/VideoLibraryManagementPage';
import ClientNutritionPage from '@/components/pages/TrainerDashboard/ClientNutritionPage';
import ProgramsCreatedPage from '@/components/pages/TrainerDashboard/ProgramsCreatedPage';
import CompletedWorkoutsFeedbackPage from '@/components/pages/TrainerDashboard/CompletedWorkoutsFeedbackPage';

import AdminDashboard from '@/components/pages/AdminDashboard';
import ExerciseVideoReviewPage from '@/components/pages/ExerciseVideoReviewPage';
import TrainerAssignmentMigration from '@/components/pages/TrainerAssignmentMigration';

// Main Layout with Header and Footer
function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}

// Root Layout with WixServicesProvider
function RootLayout() {
  return (
    <WixServicesProvider>
      <ScrollToTop />
      <SiteLayout />
    </WixServicesProvider>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    loader: rootRouteLoader,
    children: [
      {
        index: true,
        element: <HomePage />,
        routeMetadata: {
          pageIdentifier: 'home',
        },
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "blog",
        element: <BlogPage />,
      },
      {
        path: "blog/:slug",
        element: <BlogPostPage />,
      },
      {
        path: "parq",
        element: <ParQPage />,
      },
      {
        path: "online-training",
        element: <OnlineTrainingPage />,
      },
      {
        path: "privacy",
        element: <PrivacyPage />,
      },
      {
        path: "terms",
        element: <TermsPage />,
      },
      {
        path: "disclaimer",
        element: <DisclaimerPage />,
      },
      {
        path: "accessibility",
        element: <AccessibilityPage />,
      },
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
      {
        path: "payment-success",
        element: <PaymentSuccessPage />,
      },
      {
        path: "store",
        element: <></>,
        loader: defaultStoreCollectionRouteRedirectLoader,
        index: true,
      },
      {
        path: "store/:categorySlug",
        element: (
          <div className="bg-soft-white py-12 px-8 lg:px-20">
            <div className="max-w-[100rem] mx-auto">
              <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-12">
                Book Your Coaching Package
              </h1>
              <CoachingPackages />
            </div>
          </div>
        ),
        loader: storeCollectionRouteLoader,
        routeMetadata: {
          appDefId: "1380b703-ce81-ff05-f115-39571d94dfcd",
          pageIdentifier: "wix.stores.sub_pages.category",
          identifiers: {
            categorySlug: "STORES.CATEGORY.SLUG"
          }
        }
      },
      {
        path: "products/:slug",
        element: (
          <div className="bg-soft-white py-12 px-8 lg:px-20">
            <div className="max-w-[100rem] mx-auto">
              <ProductDetailsRoute />
            </div>
          </div>
        ),
        loader: productRouteLoader,
        routeMetadata: {
          appDefId: "1380b703-ce81-ff05-f115-39571d94dfcd",
          pageIdentifier: "wix.stores.sub_pages.product",
          identifiers: {
            slug: "STORES.PRODUCT.SLUG"
          }
        },
      },
      {
        path: "cart",
        element: (
          <div className="bg-soft-white py-12 px-8 lg:px-20">
            <div className="max-w-[100rem] mx-auto">
              <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-8">
                Your Cart
              </h1>
              <Cart />
            </div>
          </div>
        ),
      },
      {
        path: "role-setup",
        element: <RoleSetup />,
      },
      {
        path: "portal",
        element: (
          <MemberProtectedRoute>
            <ClientPortalLayout />
          </MemberProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "program",
            element: <MyProgramPage />,
          },
          {
            path: "nutrition",
            element: <NutritionPage />,
          },
          {
            path: "progress",
            element: <ProgressPage />,
          },
          {
            path: "bookings",
            element: <BookingsPage />,
          },
          {
            path: "video-library",
            element: <VideoLibraryPage />,
          },
          {
            path: "my-submissions",
            element: <MyVideoSubmissionsPage />,
          },
          {
            path: "history",
            element: <WorkoutHistoryPage />,
          },
        ],
      },
      {
        path: "trainer",
        element: (
          <MemberProtectedRoute>
            <TrainerDashboardLayout />
          </MemberProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <TrainerDashboardPage />,
          },
          {
            path: "clients",
            element: <TrainerClientsPage />,
          },
          {
            path: "programs",
            element: <CreateProgramPage />,
          },
          {
            path: "programs-created",
            element: <ProgramsCreatedPage />,
          },
          {
            path: "ai-assistant",
            element: <AIAssistantPage />,
          },
          {
            path: "program-editor",
            element: <ProgramEditorPage />,
          },
          {
            path: "program-editor-enhanced",
            element: <ProgramEditorEnhanced />,
          },
          {
            path: "preferences",
            element: <TrainerPreferencesPage />,
          },
          {
            path: "workout-assignment",
            element: <WorkoutAssignmentPage />,
          },
          {
            path: "video-reviews",
            element: <VideoReviewsPage />,
          },
          {
            path: "video-library",
            element: <VideoLibraryManagementPage />,
          },
          {
            path: "progress",
            element: <ClientProgressPage />,
          },
          {
            path: "nutrition",
            element: <ClientNutritionPage />,
          },
          {
            path: "workout-feedback",
            element: <CompletedWorkoutsFeedbackPage />,
          },
        ],
      },
      {
        path: "exercise-video-review",
        element: (
          <MemberProtectedRoute>
            <ExerciseVideoReviewPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <MemberProtectedRoute>
            <AdminDashboard />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin/trainer-assignment",
        element: (
          <MemberProtectedRoute>
            <TrainerAssignmentMigration />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_NAME,
});

export default function AppRouter() {
  return (
    <LanguageProvider>
      <MemberProvider>
        <RouterProvider router={router} />
      </MemberProvider>
    </LanguageProvider>
  );
}
