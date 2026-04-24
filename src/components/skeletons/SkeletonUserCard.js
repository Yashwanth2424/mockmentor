import SkeletonBase from "./SkeletonBase";

export default function SkeletonUserCard() {
      return (
            <div className="user-card">

                  <div className="user-info">
                        <SkeletonBase className="skeleton-title" />
                        <SkeletonBase className="skeleton-line short" />
                  </div>

                  <SkeletonBase className="skeleton-role" />

                  <div className="user-actions">
                        <SkeletonBase className="skeleton-btn" />
                        <SkeletonBase className="skeleton-btn" />
                  </div>

                  <SkeletonBase className="skeleton-line short" />

            </div>
      );
}