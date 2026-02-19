import { useOutletContext } from "react-router-dom";
import type { NoticeItem, ResourceItem, SiteContent } from "../../types";
import type { Locale, MessageKey } from "../../i18n/messages";

export interface PublicOutletContext {
  content: SiteContent;
  resources: ResourceItem[];
  notices: NoticeItem[];
  locale: Locale;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
}

export const usePublicOutlet = (): PublicOutletContext => useOutletContext<PublicOutletContext>();
