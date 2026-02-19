import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import {
  CompanyCeoPage,
  CompanyLocationPage,
  CompanyVisionPage,
  DefaultRedirect,
  InquiryLibraryPage,
  NotFoundPage,
  NoticePage,
  PartnerCorePage,
  ProductCategoryListPage,
  ProductCategoryPage,
  ProductItemPage,
  PublicLayout,
  QuoteInquiryPage,
  TestDemoPage
} from "./pages/PublicSite";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/admin" element={<AdminPage />} />

      <Route path="/" element={<PublicLayout />}>
        <Route index element={<DefaultRedirect />} />

        <Route path="company">
          <Route path="ceo" element={<CompanyCeoPage />} />
          <Route path="vision" element={<CompanyVisionPage />} />
          <Route path="location" element={<CompanyLocationPage />} />
        </Route>

        <Route path="partner">
          <Route path="core" element={<PartnerCorePage />} />
        </Route>

        <Route path="product">
          <Route index element={<ProductCategoryListPage />} />
          <Route path=":categorySlug" element={<ProductCategoryPage />} />
          <Route path=":categorySlug/:itemSlug" element={<ProductItemPage />} />
        </Route>

        <Route path="inquiry">
          <Route path="quote" element={<QuoteInquiryPage />} />
          <Route path="test-demo" element={<TestDemoPage />} />
          <Route path="library" element={<InquiryLibraryPage />} />
        </Route>

        <Route path="notice" element={<NoticePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
