import PageBreadcrumb from "../components/common/PageBreadCrumb";
import CombinedProfileCard from "../components/UserProfile/CombinedProfileCard";
import PageMeta from "../components/common/PageMeta";

export default function UserProfiles() {
  return (
    <>
      <PageMeta
        title="Foydalanuvchi Profillari"
        description="Kurs Platformasi - Foydalanuvchi Profillari"
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="space-y-6">
        <CombinedProfileCard />
      </div>
    </>
  );
}
