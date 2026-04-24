import SkeletonBase from "./SkeletonBase";

export default function SkeletonInterviewCard() {
      return (
            <div className="interview-card">
                  <SkeletonBase className="skeleton-title" />
                  <SkeletonBase className="skeleton-line" />
                  <SkeletonBase className="skeleton-line short" />
            </div>
      );
}