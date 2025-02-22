"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface Props {
  children?: React.ReactNode;
}

// 다른 컴포넌트에서도 사용할 수 있게 export 해준다.
export const queryClient = new QueryClient();

export const NextLayout = ({ children }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={"flex h-screen w-screen text-sm lg:text-base"}>
        <Sidebar />
        <div className="flex flex-1 flex-col lg:ml-64">
          <Header />
          <div className="flex flex-1 flex-col overflow-y-auto">
            <main className="flex flex-1 flex-col border-2 bg-gray-50">{children}</main>
            <Footer />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};
