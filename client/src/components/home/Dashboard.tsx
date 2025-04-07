import { 
  Clipboard, 
  BarChart, 
  Settings 
} from 'lucide-react';

export default function Dashboard() {
  return (
    <section id="dashboard" className="py-20 relative">
      <div className="absolute left-0 right-0 h-[500px] bg-gradient-to-b from-bg-chart/20 to-transparent"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-1">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            <div className="bg-bg-card border border-border-color rounded-2xl shadow-card overflow-hidden card-hover-effect transition duration-500 transform">
              {/* Dashboard Preview */}
              <div className="flex border-b border-border-color">
                <div className="w-1/4 bg-bg-chart/70 p-4 border-r border-border-color">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-lg bg-accent-blue/20 flex items-center justify-center">
                        <BarChart className="h-6 w-6 text-accent-blue" />
                      </div>
                      <div className="h-4 w-20 bg-bg-dark/50 rounded"></div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-2 rounded-lg bg-accent-blue/10 border border-accent-blue/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <div className="h-3 w-12 bg-text-primary/30 rounded"></div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-2 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <div className="h-3 w-12 bg-text-secondary/20 rounded"></div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-2 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="h-3 w-12 bg-text-secondary/20 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="w-3/4 p-5">
                  <div className="mb-5">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold">Dashboard</h3>
                        <p className="text-xs text-text-secondary">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-bg-chart flex items-center justify-center text-xs font-bold border border-border-color">
                          RC
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-bg-chart rounded-lg p-3">
                      <p className="text-xs text-text-secondary mb-1">Orders Today</p>
                      <p className="text-xl font-bold">156</p>
                      <div className="h-2 w-full bg-bg-dark rounded-full mt-2 overflow-hidden">
                        <div className="h-full w-[80%] bg-accent-blue rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="bg-bg-chart rounded-lg p-3">
                      <p className="text-xs text-text-secondary mb-1">Revenue</p>
                      <p className="text-xl font-bold">$3,240</p>
                      <div className="h-2 w-full bg-bg-dark rounded-full mt-2 overflow-hidden">
                        <div className="h-full w-[65%] bg-accent-green rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="bg-bg-chart rounded-lg p-3">
                      <p className="text-xs text-text-secondary mb-1">Avg. Time</p>
                      <p className="text-xl font-bold">24 min</p>
                      <div className="h-2 w-full bg-bg-dark rounded-full mt-2 overflow-hidden">
                        <div className="h-full w-[40%] bg-accent-yellow rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-bg-chart/50 rounded-lg p-4 h-[140px] flex items-end">
                    <div className="w-full flex items-end justify-between gap-1">
                      {/* Chart Bars */}
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                        const heights = [16, 24, 32, 20, 36, 48, 28];
                        const isFriday = day === 'Fri';
                        
                        return (
                          <div key={day} className="flex flex-col items-center">
                            <div 
                              className={`h-${heights[index]} w-6 ${isFriday ? 'bg-accent-blue' : 'bg-accent-blue/20'} rounded-t-md`}
                              style={{ height: `${heights[index]}px` }}
                            ></div>
                            <div className={`text-xs ${isFriday ? 'text-text-primary' : 'text-text-secondary'} mt-2`}>{day}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 order-1 lg:order-2">
            <span className="text-accent-blue font-semibold text-sm uppercase tracking-wider">Digital Control Hub</span>
            <h2 className="text-4xl font-bold mt-2 mb-6">All Your Data in One Place</h2>
            <p className="text-text-secondary text-xl mb-8">
              Get a comprehensive view of your restaurant operations with our intuitive digital command center that combines data from all your delivery services.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent-blue/20 rounded-lg flex items-center justify-center mt-1 flex-shrink-0">
                  <Clipboard className="h-5 w-5 text-accent-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Real-time Updates</h3>
                  <p className="text-text-secondary">
                    See order statuses and delivery progress as they happen, with notifications for important events.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent-green/20 rounded-lg flex items-center justify-center mt-1 flex-shrink-0">
                  <BarChart className="h-5 w-5 text-accent-green" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Advanced Analytics</h3>
                  <p className="text-text-secondary">
                    Track sales trends, popular items, and customer behavior to make data-driven decisions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent-purple/20 rounded-lg flex items-center justify-center mt-1 flex-shrink-0">
                  <Settings className="h-5 w-5 text-accent-purple" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Customizable Views</h3>
                  <p className="text-text-secondary">
                    Configure your dashboard to show the metrics that matter most to your business.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
