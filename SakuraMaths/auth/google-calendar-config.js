// Configuration publique pour l'accès Google Calendar côté navigateur.
// Le clientId OAuth est public, comme la configuration Firebase.
export const googleCalendarConfig = {
  clientId: "142017117980-lbk77egmglral5gdg0kiccq8f493c948.apps.googleusercontent.com",
  scope: "https://www.googleapis.com/auth/calendar.readonly",
  defaultCalendarId: "primary"
};

export const googleCalendarConfigured = !Object.values(googleCalendarConfig).some(value =>
  String(value).includes("A_CONFIGURER")
);
