'use client';
 
import { Phone, MapPin, Calendar, Star, Check, HelpCircle, Headphones, ChevronRight, Clock, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
 
export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed'>('active');
  const [expandedRating, setExpandedRating] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [minsLeft, setMinsLeft] = useState(25);
  const [secsLeft, setSecsLeft] = useState(0);
 
  useEffect(() => {
    const t = setInterval(() => {
      setSecsLeft(s => {
        if (s === 0) {
          setMinsLeft(m => (m > 0 ? m - 1 : 0));
          return 59;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
 
  const activeBooking = {
    id: 'SVM2024031501',
    serviceName: 'AC Repair & Service',
    workerName: 'Rajesh Kumar',
    workerRole: 'Senior AC Technician',
    workerImage: 'https://images.unsplash.com/photo-1627776880991-808c5996527b?w=200&q=80',
    currentStep: 2,
    estimatedTime: '~25 mins remaining',
    bookingDate: 'Today',
    bookingTime: '2:30 PM',
    address: 'A-204, Skyline Apartments, Koramangala',
    price: 599,
    rating: 4.8,
    jobsCompleted: 342,
    image: 'https://images.unsplash.com/photo-1631744007979-3aa9e7b48c81?w=200&q=80',
  };
 
  const upcomingBookings = [
    { id: 'SVM2024031502', serviceName: 'Deep Home Cleaning', providerName: 'CleanPro Services', date: 'Tomorrow', time: '10:00 AM', address: 'A-204, Skyline Apartments, Koramangala', price: 499, image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=200&q=80', within24Hours: true },
    { id: 'SVM2024031503', serviceName: 'Plumbing Service', providerName: 'QuickFix Solutions', date: 'Mar 5, 2026', time: '2:00 PM', address: 'B-101, Green Valley, Whitefield', price: 299, image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&q=80', within24Hours: false },
    { id: 'SVM2024031504', serviceName: 'Painting Service', providerName: 'ColorCraft Professionals', date: 'Mar 8, 2026', time: '9:00 AM', address: 'C-305, Lake View Residency, Indiranagar', price: 1999, image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=200&q=80', within24Hours: false },
  ];
 
  const completedBookings = [
    { id: 'SVM2024022801', serviceName: 'Electrical Wiring', workerName: 'Amit Singh', providerName: 'PowerFix Services', completedDate: 'Wed, Mar 4, 2026, 04:30 PM', orderId: 'ORDER #SVM2024022801', orderedAt: 'Mar 4, 2026, 02:00 PM', address: 'A-204, Skyline Apartments', price: 599, rated: true, rating: 5, image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200&q=80', items: 'Wiring & Switchboard x 1' },
    { id: 'SVM2024022502', serviceName: 'Salon at Home', workerName: 'Priya Sharma', providerName: 'GlowUp Beauty', completedDate: 'Fri, Feb 6, 2026, 11:00 AM', orderId: 'ORDER #SVM2024022502', orderedAt: 'Feb 6, 2026, 09:26 AM', address: 'A-204, Skyline Apartments', price: 399, rated: false, rating: 0, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80', items: 'Haircut & Styling x 1' },
    { id: 'SVM2024022003', serviceName: 'Car Washing', workerName: 'Vikram Reddy', providerName: 'SparkleWash', completedDate: 'Thu, Feb 20, 2026, 09:00 AM', orderId: 'ORDER #SVM2024022003', orderedAt: 'Feb 20, 2026, 07:30 AM', address: 'B-101, Green Valley', price: 299, rated: true, rating: 4, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80', items: 'Full Car Wash x 1' },
    { id: 'SVM2024021504', serviceName: 'Pest Control', workerName: 'Suresh Patel', providerName: 'BugFree Solutions', completedDate: 'Sat, Feb 15, 2026, 03:00 PM', orderId: 'ORDER #SVM2024021504', orderedAt: 'Feb 15, 2026, 01:00 PM', address: 'C-305, Lake View Residency', price: 799, rated: true, rating: 5, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=200&q=80', items: 'Cockroach Control x 1' },
  ];
 
  const progressSteps = ['Confirmed', 'En Route', 'Arrived', 'In Progress', 'Done'];
 
  const tabs = [
    { key: 'active' as const, label: 'Active', count: 1 },
    { key: 'upcoming' as const, label: 'Upcoming', count: upcomingBookings.length },
    { key: 'completed' as const, label: 'Past Bookings', count: completedBookings.length },
  ];
 
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F5F7FA' }}>
 
      {/* LEFT SIDEBAR */}
      <aside style={{ width: 220, background: '#ffffff', borderRight: '1px solid #E8ECF0', position: 'sticky', top: 0, height: '100vh', overflow: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '32px 20px' }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 28 }}>My Bookings</h1>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tabs.map(tab => {
              const active = activeTab === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: active ? '#F8FAFC' : 'transparent', borderLeft: active ? '2px solid #F97316' : '2px solid transparent', transition: 'all 0.15s' }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#F8FAFC'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? '#0F172A' : '#64748B' }}>{tab.label}</span>
                  {active && <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>{tab.count}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
 
      {/* MAIN CONTENT */}
      <main style={{ flex: 1, overflow: 'auto', padding: '32px 40px', background: '#F5F7FA' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
 
          {/* ── ACTIVE ── */}
          {activeTab === 'active' && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8ECF0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '24px 28px', borderBottom: '1px solid #E8ECF0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>{activeBooking.serviceName}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748B' }}>
                      <Calendar style={{ width: 14, height: 14 }} />
                      <span>{activeBooking.bookingDate}, {activeBooking.bookingTime}</span>
                    </div>
                  </div>
                  <span style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8 }}>In Progress</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', border: '1px solid #E8ECF0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#64748B' }}>
                  <MapPin style={{ width: 14, height: 14, color: '#94A3B8', flexShrink: 0 }} />
                  <span>{activeBooking.address}</span>
                </div>
              </div>
              <div style={{ padding: '20px 28px', borderBottom: '1px solid #E8ECF0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <img src={activeBooking.workerImage} alt={activeBooking.workerName} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>{activeBooking.workerName}</p>
                      <p style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>{activeBooking.workerRole}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B' }}>
                        <Star style={{ width: 12, height: 12, color: '#F59E0B', fill: '#F59E0B' }} />
                        <span style={{ fontWeight: 600 }}>{activeBooking.rating}</span>
                        <span style={{ color: '#CBD5E1' }}>•</span>
                        <span>{activeBooking.jobsCompleted} jobs</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={e => {
                        const tooltip = (e.currentTarget as HTMLElement).nextElementSibling as HTMLElement;
                        if (tooltip) tooltip.style.display = tooltip.style.display === 'none' ? 'block' : 'none';
                      }}
                      style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid #E8ECF0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Phone style={{ width: 15, height: 15, color: '#64748B' }} />
                    </button>
                    <div style={{ display: 'none', position: 'absolute', right: 0, top: 44, background: '#1A3C6E', color: '#fff', fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 8, whiteSpace: 'nowrap' as const, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10 }}>
                      📞 +91 98765 43210
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '20px 28px', background: '#F8FAFC', borderBottom: '1px solid #E8ECF0' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 20 }}>Service Progress</p>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 13, left: 13, right: 13, height: 2, background: '#E2E8F0', borderRadius: 2 }}>
                    <div style={{ height: 2, background: '#F97316', borderRadius: 2, width: `${(activeBooking.currentStep / (progressSteps.length - 1)) * 100}%` }} />
                  </div>
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
                    {progressSteps.map((step, i) => {
                      const done = i < activeBooking.currentStep;
                      const current = i === activeBooking.currentStep;
                      return (
                        <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done || current ? '#F97316' : '#fff', border: done || current ? 'none' : '2px solid #E2E8F0', boxShadow: current ? '0 0 0 3px rgba(249,115,22,0.15)' : 'none' }}>
                            {done ? <Check style={{ width: 13, height: 13, color: '#fff' }} /> : current ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} /> : <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#CBD5E1' }} />}
                          </div>
                          <p style={{ fontSize: 11, fontWeight: i <= activeBooking.currentStep ? 600 : 400, color: i <= activeBooking.currentStep ? '#0F172A' : '#94A3B8', textAlign: 'center' as const }}>{step}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{ marginTop: 20, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '14px 16px' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#15803D', marginBottom: 3 }}>
                    Arriving by <span style={{ fontSize: 15 }}>3:00 PM today</span>
                  </p>
                  <p style={{ fontSize: 12, color: '#16A34A' }}>
                    Estimated arrival in <span style={{ fontWeight: 700 }}>{minsLeft}m {String(secsLeft).padStart(2,'0')}s</span>
                  </p>
                </div>
              </div>
              <div style={{ padding: '20px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', border: '1px solid #E8ECF0', borderRadius: 8, padding: '12px 16px' }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>Total Amount</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>₹{activeBooking.price}</span>
                </div>
              </div>
            </div>
          )}
 
          {/* ── UPCOMING ── */}
          {activeTab === 'upcoming' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcomingBookings.map(booking => (
                <div key={booking.id}
                  style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8ECF0', borderTop: booking.within24Hours ? '3px solid #F97316' : '1px solid #E8ECF0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}
                >
                  {booking.within24Hours && (
                    <div style={{ background: '#FFF7ED', borderBottom: '1px solid #FED7AA', padding: '7px 20px', display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F97316' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#EA580C' }}>Upcoming within 24 hours</span>
                    </div>
                  )}
                  <div style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <img src={booking.image} alt={booking.serviceName} style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>{booking.serviceName}</p>
                          <p style={{ fontSize: 12, color: '#94A3B8' }}>{booking.providerName}</p>
                        </div>
                      </div>
                      <p style={{ fontSize: 17, fontWeight: 700, color: '#0F172A' }}>₹{booking.price}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#64748B' }}>
                        <Calendar style={{ width: 13, height: 13, color: '#94A3B8' }} />
                        <span>{booking.date}, {booking.time}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#64748B' }}>
                        <MapPin style={{ width: 13, height: 13, color: '#94A3B8', flexShrink: 0 }} />
                        <span>{booking.address}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid #F1F5F9', paddingTop: 14 }}>
                      <button style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>Reschedule</button>
                      <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'none', fontSize: 13, fontWeight: 600, color: '#EF4444', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
 
          {/* ── COMPLETED (Swiggy-style) ── */}
          {activeTab === 'completed' && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>Past Bookings</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {completedBookings.map(booking => (
                  <div key={booking.id} style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #E8ECF0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
 
                    {/* Top section — provider info + delivery status */}
                    <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      <img src={booking.image} alt={booking.serviceName}
                        style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 3 }}>{booking.serviceName}</p>
                        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>{booking.address}</p>
                        <p style={{ fontSize: 12, color: '#94A3B8' }}>
                          {booking.orderId} | {booking.orderedAt}
                        </p>
                        <button style={{ marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#F97316', padding: 0 }}>
                          VIEW DETAILS
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 13, color: '#64748B' }}>Completed on {booking.completedDate}</span>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check style={{ width: 12, height: 12, color: '#fff' }} />
                        </div>
                      </div>
                    </div>
 
                    {/* Divider */}
                    <div style={{ borderTop: '1px dashed #E2E8F0', margin: '0 24px' }} />
 
                    {/* Bottom section — items + price + actions */}
                    <div style={{ padding: '14px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <span style={{ fontSize: 14, color: '#374151' }}>{booking.items}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Total Paid: ₹{booking.price}</span>
                      </div>
 
                      {/* Rating or actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button style={{ background: '#F97316', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#EA580C')}
                          onMouseLeave={e => (e.currentTarget.style.background = '#F97316')}
                        >
                          <RefreshCw style={{ width: 13, height: 13 }} /> REBOOK
                        </button>
 
                        {!booking.rated ? (
                          <div>
                            {expandedRating === booking.id ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 13, color: '#64748B' }}>Rate:</span>
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button key={star} onClick={() => { setRatings(r => ({ ...r, [booking.id]: star })); setExpandedRating(null); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                                    <Star style={{ width: 22, height: 22, color: '#F59E0B', fill: (ratings[booking.id] ?? 0) >= star ? '#F59E0B' : 'none' }} />
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <button onClick={() => setExpandedRating(booking.id)}
                                style={{ background: '#fff', color: '#F97316', border: '1.5px solid #F97316', borderRadius: 6, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                                RATE SERVICE
                              </button>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 13, color: '#64748B' }}>Your rating:</span>
                            <div style={{ display: 'flex', gap: 2 }}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} style={{ width: 16, height: 16, color: '#F59E0B', fill: booking.rating >= star ? '#F59E0B' : 'none' }} />
                              ))}
                            </div>
                          </div>
                        )}
 
                        <button style={{ background: '#fff', color: '#64748B', border: '1.5px solid #E2E8F0', borderRadius: 6, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                          HELP
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
 
        </div>
      </main>
 
      {/* RIGHT PANEL */}
      <aside style={{ width: 260, background: '#ffffff', borderLeft: '1px solid #E8ECF0', position: 'sticky', top: 0, height: '100vh', overflow: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '32px 20px' }}>
          {activeTab === 'active' && (
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>Booking Summary</p>
              <div style={{ background: '#F8FAFC', border: '1px solid #E8ECF0', borderRadius: 10, padding: '14px 16px' }}>
                {[{ label: 'Status', value: 'In Progress', color: '#059669' }, { label: 'Date', value: activeBooking.bookingDate, color: '#0F172A' }, { label: 'Time', value: activeBooking.bookingTime, color: '#0F172A' }].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: '#64748B' }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: row.color }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 10, marginTop: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>Total</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>₹{activeBooking.price}</span>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'upcoming' && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E8ECF0', borderRadius: 10, padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: 30, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{upcomingBookings.length}</p>
                <p style={{ fontSize: 13, color: '#64748B' }}>Upcoming Bookings</p>
              </div>
            </div>
          )}
          {activeTab === 'completed' && (
            <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E8ECF0', borderRadius: 10, padding: '18px', textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{completedBookings.length}</p>
                <p style={{ fontSize: 13, color: '#64748B' }}>Services Completed</p>
              </div>
              <div style={{ background: '#F8FAFC', border: '1px solid #E8ECF0', borderRadius: 10, padding: '18px', textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#F97316', marginBottom: 4 }}>₹{completedBookings.reduce((s, b) => s + b.price, 0)}</p>
                <p style={{ fontSize: 13, color: '#64748B' }}>Total Spent</p>
              </div>
            </div>
          )}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>Need Help?</p>
            {[{ Icon: Headphones, label: 'Contact Support' }, { Icon: HelpCircle, label: 'Help Center' }].map(({ Icon, label }) => (
              <button key={label} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', fontSize: 13, fontWeight: 500, color: '#475569', cursor: 'pointer', marginBottom: 8 }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
              >
                <Icon style={{ width: 14, height: 14 }} /> {label}
              </button>
            ))}
          </div>
        </div>
      </aside>
 
    </div>
  );
}