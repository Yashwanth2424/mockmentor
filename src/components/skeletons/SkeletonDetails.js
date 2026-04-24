import SkeletonBase from "./SkeletonBase";

export default function SkeletonDetails() {
      return (
            <div className="details-container">

                  {/* Back button skeleton */}
                  <SkeletonBase className="skeleton-back" />

                  <div className="details-card">

                        {/* Title */}
                        <SkeletonBase className="skeleton-title" />

                        {/* Info lines */}
                        <SkeletonBase className="skeleton-line" />
                        <SkeletonBase className="skeleton-line" />

                        {/* Feedback box */}
                        <div className="feedback-box">
                              <SkeletonBase className="skeleton-subtitle" />
                              <SkeletonBase className="skeleton-line" />
                              <SkeletonBase className="skeleton-line short" />
                        </div>

                  </div>
            </div>
      );
}