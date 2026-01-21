import { lazy, Suspense } from 'react';
import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import { rootRouteLoader, WixServicesProvider } from '@/wix-verticals/react-pages/react-router/routes/root';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { ProductDetailsRoute, productRouteLoader } from '@/wix-verticals/react-pages/react-router/routes/product-details';
import { storeCollectionRouteLoader } from '@/wix-verticals/react-pages/react-router/routes/store-collection';
import { defaultStoreCollectionRouteRedirectLoader } from '@/wix-verticals/react-pages/react-router/routes/store-redirect';
import { Cart } from '@/wix-verticals/react-pages/react-router/routes/cart';
import { MemberProtectedRoute } from '@/components/ui/member-protected-route';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/CookieBanner';

// Lazy load pages
const RoleSetup = lazy(() => import('@/components/RoleSetup'));
const HomePage = lazy(() => import('@/components/pages/HomePage'));
const AboutPage = lazy(() => import('@/components/pages/AboutPage'));
const BlogPage = lazy(() => import('@/components/pages/BlogPage'));
const BlogPostPage = lazy(() => import('@/components/pages/BlogPostPage'));
const CheckoutPage = lazy(() => import('@/components/pages/CheckoutPage'));
const PaymentSuccessPage = lazy(() => import('@/components/pages/PaymentSuccessPage'));
const OnlineTrainingPage = lazy(() => import('@/components/pages/OnlineTrainingPage'));
const PrivacyPage = lazy(() => import('@/components/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/components/pages/TermsPage'));
const DisclaimerPage = lazy(() => import('@/components/pages/DisclaimerPage'));
const AccessibilityPage = lazy(() => import('@/components/pages/AccessibilityPage'));
const CoachingPackages = lazy(() => import('@/components/store/CoachingPackages'));

// Client Portal Pages
const ClientPortalLayout = lazy(() => import('@/components/pages/ClientPortal/ClientPortalLayout'));
const DashboardPage = lazy(() => import('@/components/pages/ClientPortal/DashboardPage'));
const MyProgramPage = lazy(() => import('@/components/pages/ClientPortal/MyProgramPage'));
const NutritionPage = lazy(() => import('@/components/pages/ClientPortal/NutritionPage'));
const ProgressPage = lazy(() => import('@/components/pages/ClientPortal/ProgressPage'));
const BookingsPage = lazy(() => import('@/components/pages/ClientPortal/BookingsPage'));
const VideoLibraryPage = lazy(() => import('@/components/pages/ClientPortal/VideoLibraryPage'));
const WorkoutHistoryPage = lazy(() => import('@/components/pages/ClientPortal/WorkoutHistoryPage'));
const ProfilePage = lazy(() => import('@/components/pages/ClientPortal/ProfilePage'));

// Trainer Dashboard Pages
const TrainerDashboardLayout = lazy(() => import('@/components/pages/TrainerDashboard/TrainerDashboardLayout'));
const TrainerDashboardPage = lazy(() => import('@/components/pages/TrainerDashboard/TrainerDashboardPage'));
const TrainerClientsPage = lazy(() => import('@/components/pages/TrainerDashboard/TrainerClientsPage'));
const CreateProgramPage = lazy(() => import('@/components/pages/TrainerDashboard/CreateProgramPage'));
const VideoReviewsPage = lazy(() => import('@/components/pages/TrainerDashboard/VideoReviewsPage'));
const ClientProgressPage = lazy(() => import('@/components/pages/TrainerDashboard/ClientProgressPage'));
const AIAssistantPage = lazy(() => import('@/components/pages/TrainerDashboard/AIAssistantPage'));
const ProgramEditorPage = lazy(() => import('@/components/pages/TrainerDashboard/ProgramEditorPage'));
const ProgramEditorEnhanced = lazy(() => import('@/components/pages/TrainerDashboard/ProgramEditorEnhanced'));
const TrainerPreferencesPage = lazy(() => import('@/components/pages/TrainerDashboard/TrainerPreferencesPage'));
const TrainerProfilePage = lazy(() => import('@/components/pages/TrainerDashboard/TrainerProfilePage'));
const WorkoutAssignmentPage = lazy(() => import('@/components/pages/TrainerDashboard/WorkoutAssignmentPage'));
const VideoLibraryManagementPage = lazy(() => import('@/components/pages/TrainerDashboard/VideoLibraryManagementPage'));
const ClientNutritionPage = lazy(() => import('@/components/pages/TrainerDashboard/ClientNutritionPage'));
const ProgramsCreatedPage = lazy(() => import('@/components/pages/TrainerDashboard/ProgramsCreatedPage'));
const CompletedWorkoutsFeedbackPage = lazy(() => import('@/components/pages/TrainerDashboard/CompletedWorkoutsFeedbackPage'));
const ClientProfilePage = lazy(() => import('@/components/pages/TrainerDashboard/ClientProfilePage'));
const ParqSubmissionsPage = lazy(() => import('@/components/pages/TrainerDashboard/ParqSubmissionsPage'));

const AdminDashboard = lazy(() => import('@/components/pages/AdminDashboard'));
const ExerciseVideoReviewPage = lazy(() => import('@/components/pages/ExerciseVideoReviewPage'));
const TrainerAssignmentMigration = lazy(() => import('@/components/pages/TrainerAssignmentMigration'));
const WomensPARQForm = lazy(() => import('@/components/WomensPARQForm'));

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
        element: (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <HomePage />
          </Suspense>
        ),
        routeMetadata: {
          pageIdentifier: 'home',
        },
      },
      {
        path: "about",
        element: (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <AboutPage />
          </Suspense>
        ),
      },
      {
        path: "blog",
        element: (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <BlogPage />
          </Suspense>
        ),
      },
      {
        path: "blog/:slug",
        element: (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <BlogPostPage />
          </Suspense>
        ),
      },
      {
        path: "online-training",
        element: (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <OnlineTrainingPage />
          </Suspense>
        ),
      },
      {
        path: "privacy",
        element: (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <PrivacyPage />
          </Suspense>
        ),
      },
      {
        path: "terms",
        element: (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <TermsPage />
          </Suspense>
        ),
      },
      {
        path: "disclaimer",
        element: (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <DisclaimerPage />
          </Suspense>
        ),
      },
      {
        path: "accessibility",
        element: (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <AccessibilityPage />
          </Suspense>
        ),
      },
      {
        path: "checkout",
        element: (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <CheckoutPage />
          </Suspense>
        ),
      },
      {
        path: "payment-success",
        element: (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <PaymentSuccessPage />
          </Suspense>
        ),
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
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <div className="bg-soft-white py-12 px-8 lg:px-20">
              <div className="max-w-[100rem] mx-auto">
                <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-12">
                  Book Your Coaching Package
                </h1>
                <CoachingPackages />
              </div>
            </div>
          </Suspense>
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
        element: (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <RoleSetup />
          </Suspense>
        ),
      },
      {
        path: "portal",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
              <ClientPortalLayout />
            </Suspense>
          </MemberProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: "program",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <MyProgramPage />
              </Suspense>
            ),
          },
          {
            path: "nutrition",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <NutritionPage />
              </Suspense>
            ),
          },
          {
            path: "progress",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <ProgressPage />
              </Suspense>
            ),
          },
          {
            path: "bookings",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <BookingsPage />
              </Suspense>
            ),
          },
          {
            path: "video-library",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <VideoLibraryPage />
              </Suspense>
            ),
          },
          {
            path: "history",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <WorkoutHistoryPage />
              </Suspense>
            ),
          },
          {
            path: "profile",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <ProfilePage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "trainer",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
              <TrainerDashboardLayout />
            </Suspense>
          </MemberProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <TrainerDashboardPage />
              </Suspense>
            ),
          },
          {
            path: "clients",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <TrainerClientsPage />
              </Suspense>
            ),
          },
          {
            path: "programs",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <CreateProgramPage />
              </Suspense>
            ),
          },
          {
            path: "programs-created",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <ProgramsCreatedPage />
              </Suspense>
            ),
          },
          {
            path: "ai-assistant",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <AIAssistantPage />
              </Suspense>
            ),
          },
          {
            path: "program-editor",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <ProgramEditorPage />
              </Suspense>
            ),
          },
          {
            path: "program-editor-enhanced",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <ProgramEditorEnhanced />
              </Suspense>
            ),
          },
          {
            path: "preferences",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <TrainerPreferencesPage />
              </Suspense>
            ),
          },
          {
            path: "profile",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <TrainerProfilePage />
              </Suspense>
            ),
          },
          {
            path: "workout-assignment",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <WorkoutAssignmentPage />
              </Suspense>
            ),
          },
          {
            path: "video-reviews",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <VideoReviewsPage />
              </Suspense>
            ),
          },
          {
            path: "video-library",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <VideoLibraryManagementPage />
              </Suspense>
            ),
          },
          {
            path: "progress",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <ClientProgressPage />
              </Suspense>
            ),
          },
          {
            path: "nutrition",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <ClientNutritionPage />
              </Suspense>
            ),
          },
          {
            path: "workout-feedback",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <CompletedWorkoutsFeedbackPage />
              </Suspense>
            ),
          },
          {
            path: "client-profile/:clientId",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <ClientProfilePage />
              </Suspense>
            ),
          },
          {
            path: "parq-submissions",
            element: (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
                <ParqSubmissionsPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "exercise-video-review",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
              <ExerciseVideoReviewPage />
            </Suspense>
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
              <AdminDashboard />
            </Suspense>
          </MemberProtectedRoute>
        ),
      },
      {
        path: "admin/trainer-assignment",
        element: (
          <MemberProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
              <TrainerAssignmentMigration />
            </Suspense>
          </MemberProtectedRoute>
        ),
      },
      {
        path: "parq",
        element: (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
            <WomensPARQForm />
          </Suspense>
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
