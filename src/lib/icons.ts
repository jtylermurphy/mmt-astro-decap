import { icon } from "@fortawesome/fontawesome-svg-core";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import { faEnvelope, faClock } from "@fortawesome/free-regular-svg-icons";
import { faFacebook, faInstagram, faTiktok, faYoutube, faThreads } from "@fortawesome/free-brands-svg-icons";

export const icons = {
  phone: icon(faPhone).html.join(""),
  envelope: icon(faEnvelope).html.join(""),
  clock: icon(faClock).html.join(""),
  facebook: icon(faFacebook).html.join(""),
  instagram: icon(faInstagram).html.join(""),
  tiktok: icon(faTiktok).html.join(""),
  youtube: icon(faYoutube).html.join(""),
  threads: icon(faThreads).html.join(""),
};
