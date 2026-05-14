import SkeletonBase from "./SkeletonBase";

export default function SkeletonDetails() {
      return (
            <div className="details-container">

                  <SkeletonBase className="skeleton-back" />

                  <div className="details-card">

                        <SkeletonBase className="skeleton-title" />

                        <SkeletonBase className="skeleton-line" />
                        <SkeletonBase className="skeleton-line" />

                        <div className="feedback-box">
                              <SkeletonBase className="skeleton-subtitle" />
                              <SkeletonBase className="skeleton-line" />
                              <SkeletonBase className="skeleton-line short" />
                        </div>

                  </div>
            </div>
      );
}