
import SideBar from "@/components/sideBar";

const MainLayout = ({children,}: {children: React.ReactNode;}) => {
  return (
    <div className="flex h-screen bg-background">
      <SideBar />
      <main className="flex-1 overflow-y-auto bg-card">
        <div className="space-y-12 px-10 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;