"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Props {
  children?: React.ReactNode;
}

// const queryClient = new QueryClient();
//
// export const NextProvider = ({ children }: Props) => {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <SessionProvider>
//         <GoogleAnalytics />
//         {children}
//         <Toaster />
//       </SessionProvider>
//       <ReactQueryDevtools />
//     </QueryClientProvider>
//   );
// };

export const NextLayout = ({ children }: Props) => {
  return (
    <div className={"flex h-screen w-screen text-sm lg:text-base"}>
      <Sidebar />
      <div className="flex flex-1 flex-col lg:ml-64">
        <Header />
        <div className="flex flex-1 flex-col overflow-y-auto">
          <main className="flex flex-1 flex-col border-2 bg-gray-200">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
};
