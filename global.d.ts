import type { AbstractIntlMessages } from "next-intl";

declare global {
  interface IntlMessages extends AbstractIntlMessages {}
}
