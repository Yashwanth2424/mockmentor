import "./skeleton.css";

export default function SkeletonDashboard() {

      return (
            <section className="dashboard-page">

                  {/* HEADER */}

                  <div className="dashboard-header">

                        <div>

                              <div className="skeleton skeleton-title"></div>

                              <div className="skeleton skeleton-subtitle"></div>
                        </div>

                        <div className="skeleton skeleton-button"></div>
                  </div>

                  {/* STATS */}

                  <div className="stats-grid">

                        {Array(4)
                              .fill(0)
                              .map((_, index) => (

                                    <div
                                          key={index}
                                          className="stats-card"
                                    >

                                          <div className="skeleton skeleton-icon"></div>

                                          <div className="skeleton-stats-content">

                                                <div className="skeleton skeleton-label"></div>

                                                <div className="skeleton skeleton-number"></div>
                                          </div>
                                    </div>
                              ))}
                  </div>

                  {/* RECENT */}

                  <div className="recent-section">

                        <div className="section-header">

                              <div className="skeleton skeleton-section-title"></div>

                              <div className="skeleton skeleton-link"></div>
                        </div>

                        <div className="recent-list">

                              {Array(5)
                                    .fill(0)
                                    .map((_, index) => (

                                          <div
                                                key={index}
                                                className="recent-card"
                                          >

                                                <div>

                                                      <div className="skeleton skeleton-card-title"></div>

                                                      <div className="skeleton skeleton-card-text"></div>

                                                      <div className="skeleton skeleton-status"></div>
                                                </div>

                                                <div className="skeleton skeleton-details"></div>
                                          </div>
                                    ))}
                        </div>
                  </div>
            </section>
      );
}