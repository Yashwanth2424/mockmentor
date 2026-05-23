import "./loading.css";

export default function DashboardLoading() {

      return (
            <section className="dashboard-loading-page">

                  {/* HEADER */}

                  <div className="dashboard-header">

                        <div>

                              <div className="dashboard-skeleton skeleton-title"></div>

                              <div className="dashboard-skeleton skeleton-subtitle"></div>
                        </div>

                        <div className="dashboard-skeleton skeleton-button"></div>
                  </div>

                  {/* STATS */}

                  <div className="stats-grid">

                        {Array.from({
                              length: 4,
                        }).map((_, index) => (

                              <div
                                    key={index}
                                    className="stats-card"
                              >

                                    <div className="dashboard-skeleton skeleton-icon"></div>

                                    <div className="stats-content">

                                          <div className="dashboard-skeleton skeleton-label"></div>

                                          <div className="dashboard-skeleton skeleton-number"></div>
                                    </div>
                              </div>
                        ))}
                  </div>

                  {/* RECENT */}

                  <div className="recent-section">

                        <div className="section-header">

                              <div className="dashboard-skeleton skeleton-section-title"></div>

                              <div className="dashboard-skeleton skeleton-link"></div>
                        </div>

                        <div className="recent-list">

                              {Array.from({
                                    length: 5,
                              }).map((_, index) => (

                                    <div
                                          key={index}
                                          className="recent-card"
                                    >

                                          <div className="recent-left">

                                                <div className="dashboard-skeleton skeleton-card-title"></div>

                                                <div className="dashboard-skeleton skeleton-card-text"></div>

                                                <div className="dashboard-skeleton skeleton-status"></div>
                                          </div>

                                          <div className="dashboard-skeleton skeleton-details"></div>
                                    </div>
                              ))}
                        </div>
                  </div>
            </section>
      );
}