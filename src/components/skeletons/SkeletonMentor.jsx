import "./skeleton.css";

export default function SkeletonMentor() {
      return (
            <div className="skeleton-mentor-page">

                  {/* HEADER */}
                  <div className="skeleton-mentor-header">
                        <div className="skeleton skeleton-mentor-title"></div>
                        <div className="skeleton skeleton-mentor-subtitle"></div>
                  </div>

                  {/* AVAILABILITY BOX */}
                  <div className="skeleton-availability-box">
                        <div className="skeleton skeleton-availability-title"></div>

                        {Array(4).fill(0).map((_, i) => (
                              <div key={i} className="skeleton-availability-row">
                                    <div className="skeleton skeleton-day-label"></div>
                                    <div className="skeleton skeleton-day-select"></div>
                                    <div className="skeleton skeleton-day-select"></div>
                              </div>
                        ))}

                        <div className="skeleton skeleton-save-btn"></div>
                  </div>

                  {/* FILTER TABS */}
                  <div className="skeleton-filter-tabs">
                        {Array(4).fill(0).map((_, i) => (
                              <div key={i} className="skeleton skeleton-tab"></div>
                        ))}
                  </div>

                  {/* INTERVIEW CARDS */}
                  <div className="skeleton-mentor-grid">
                        {Array(4).fill(0).map((_, i) => (
                              <div key={i} className="skeleton-mentor-card">
                                    <div className="skeleton skeleton-mentor-card-title"></div>
                                    <div className="skeleton skeleton-mentor-card-line"></div>
                                    <div className="skeleton skeleton-mentor-card-line short"></div>
                                    <div className="skeleton skeleton-mentor-card-line"></div>
                                    <div className="skeleton skeleton-mentor-status"></div>
                                    <div className="skeleton skeleton-mentor-btn"></div>
                              </div>
                        ))}
                  </div>
            </div>
      );
}