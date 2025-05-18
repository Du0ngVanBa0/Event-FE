import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import MainLayout from "./components/layout/main-layout/MainLayout";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminRoute from "./components/common/AdminRoute";
import Login from "./components/pages/login/Login";
import Register from "./components/pages/register/Register";
import CreateEvent from "./components/pages/create-event/CreateEvent";
import BookTicket from "./components/pages/book-ticket/BookTicket";
import EventType from "./components/pages/danh-muc-su-kien/EventType";
import ChangeInformation from "./components/pages/change-infomation/ChangeInformation";
import LandingPage from "./components/pages/home/LandingPage";
import ApproveEvent from "./components/pages/approve-event/ApproveEvent";
import MyEvents from "./components/pages/my-events/MyEvents";
import EditEvent from "./components/pages/edit-event/EditEvent";
import Events from "./components/pages/events/Events";
import EventDetail from "./components/pages/event-detail/EventDetail";
import Payment from "./components/pages/payment/Payment";
import PaymentResult from "./components/pages/payment-result/PaymentResult";
import MyTickets from "./components/pages/my-tickets/MyTickets";
import Dashboard from "./components/pages/admin/Dashboard";
import BookingDetail from "./components/pages/booking-detail/BookingDetail";
import ZoneDesigner from "./components/common/zone-design/EventZoneDesigner";
import DefaultView from "./components/common/zone-design/DefaultView";
import AdminBookingTickets from "./components/pages/manage-ticket/AdminBookingTickets";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="zone-designer" element={<ZoneDesigner />} />
          <Route path="designer" element={<DefaultView />} />

          <Route path="/" element={<MainLayout />}>
            <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>}>
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={null} />
              <Route path="approve-events" element={<ApproveEvent />} />
              <Route path="event-types" element={<EventType />} />
              <Route path="booking-tickets" element={<AdminBookingTickets />} />
            </Route>

            <Route
              path="/organizer/create-event"
              element={
                <ProtectedRoute>
                  <CreateEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id"
              element={
                <ProtectedRoute>
                  <EventDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/edit-event/:id"
              element={
                <ProtectedRoute>
                  <EditEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-events"
              element={
                <ProtectedRoute>
                  <MyEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-tickets"
              element={
                <ProtectedRoute>
                  <MyTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/settings"
              element={
                <ProtectedRoute>
                  <ChangeInformation />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/booking/:id"
              element={
                <ProtectedRoute>
                  <BookTicket />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/result"
              element={
                <ProtectedRoute>
                  <PaymentResult />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings/:id"
              element={
                <ProtectedRoute>
                  <BookingDetail />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
