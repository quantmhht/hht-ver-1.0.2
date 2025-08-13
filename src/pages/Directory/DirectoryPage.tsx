import React from "react";
import PageLayout from "@components/layout/PageLayout";
import { VerticalUtinities } from "@components";
import { CONTACTS } from "@constants/utinities";

const DirectoryPage: React.FC = () => {
  return (
    <PageLayout title="Danh bạ">
      <VerticalUtinities title="Danh bạ lãnh đạo phường Hà Huy Tập" utinities={CONTACTS} />
    </PageLayout>
  );
};

export default DirectoryPage;
