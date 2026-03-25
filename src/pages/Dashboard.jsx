import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Header from '../components/layout/Header';
import TabNav from '../components/layout/TabNav';
import FilterBar from '../components/filters/FilterBar';
import FileUploader from '../components/upload/FileUploader';
import DetailDrawer from '../components/tables/DetailDrawer';

import OverviewTab from './OverviewTab';
import TrendsTab from './TrendsTab';
import ErrorsTab from './ErrorsTab';
import EndpointsTab from './EndpointsTab';
import RequestsTab from './RequestsTab';
import InsightsTab from './InsightsTab';
import RawDataTab from './RawDataTab';
import Footer from '../components/layout/Footer';

const TAB_COMPONENTS = {
  overview: OverviewTab,
  trends: TrendsTab,
  errors: ErrorsTab,
  endpoints: EndpointsTab,
  requests: RequestsTab,
  insights: InsightsTab,
  raw: RawDataTab,
};

export default function Dashboard() {
  const { state } = useContext(AppContext);
  const { rawFile, isParsing, activeTab } = state;

  const hasData = !!rawFile;
  
  const ActiveComponent = TAB_COMPONENTS[activeTab] || OverviewTab;

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface transition-colors duration-200">
      <Header />
      
      {!hasData || isParsing ? (
        <main className="flex-1 w-full">
          <FileUploader />
        </main>
      ) : (
        <>
          <TabNav />
          <FilterBar />
          
          <main className="flex-1 container mx-auto px-4 pb-12">
            <ActiveComponent />
          </main>
          
          <DetailDrawer />
        </>
      )}
      
      <Footer />
    </div>
  );
}
