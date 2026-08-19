import type { Metadata } from "next";
import {
  A,
  Callout,
  CONTACT_EMAIL,
  LegalPage,
  P,
  Section,
  UL,
} from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy policy — favTube",
  description:
    "Exactly what favTube stores about you, who else sees it, and how to get rid of it.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      lede="Exactly what favTube stores about you, who else can see it, and how to get rid of it. No vague language. This describes what the code actually does."
    >
      <Section title="1. Who we are">
        <P>
          favTube is a personal project operated from Somaliland by an
          individual, who is the data controller for the information described
          here. For anything on this page, whether a question, a correction, a
          copy of your data, or a deletion request, email{" "}
          <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A>.
        </P>
      </Section>

      <Section title="2. What we collect">
        <P>
          <strong>What you give us.</strong> Your name, email address, password,
          username, and bio; the videos in your top ten; and the comments,
          likes, and follows you make. Your password is never stored as you
          typed it, only as a cryptographic hash that cannot be reversed.
        </P>
        <P>
          <strong>What Google gives us, if you sign in with Google.</strong>{" "}
          Your Google account identifier, name, email address, whether Google
          has verified that email, and the URL of your Google profile picture.
          We request only the <code>openid</code>, <code>email</code>, and{" "}
          <code>profile</code> scopes. We never see your Google password. The
          profile picture URL is stored but never displayed, because every
          profile on favTube currently shows the same default avatar.
        </P>
        <P>
          Google sign-in also hands us access and refresh tokens for your Google
          account, and we store them alongside the details above. favTube never
          uses them for anything. Nothing in the app calls a Google API on your
          behalf, and the only reason they are there is that the authentication
          library keeps them by default. They are deleted with your account, and
          you can cut them off sooner from{" "}
          <A href="https://myaccount.google.com/permissions">
            Google&apos;s permissions page
          </A>
          .
        </P>
        <P>
          <strong>What we collect automatically.</strong> Close to nothing. When
          you sign in we store a session, which is a random token and an expiry
          date, and that is what keeps you signed in. Your IP address is used in
          passing to rate limit repeated sign-in attempts, but it is not written
          to our database. The authentication library favTube uses would store
          your IP address and browser user-agent on every session by default,
          and we deliberately blank both, because we had no use for them.
        </P>
        <Callout>
          <strong>Your username may come from your email address.</strong> If
          you sign up with Google, favTube builds your first username out of the
          part of your email address before the @ sign. That username is your
          public profile URL, so your email prefix becomes publicly visible
          until you change it. You can change your username at any time in{" "}
          <A href="/settings">settings</A>.
        </Callout>
      </Section>

      <Section title="3. What we do not collect">
        <P>
          This is short, and true. favTube runs <strong>no analytics</strong>,
          no advertising, no tracking pixels, no fingerprinting, and no
          third-party error tracking. There is no Google Analytics, no Vercel
          Analytics, no PostHog, no Meta pixel, and no Sentry. We keep no log of
          your IP address and no record of which browser or device you used. We
          do not build profiles of you, and we do not sell, rent, or trade your
          personal information to anyone, for any purpose.
        </P>
        <P>
          The &quot;profile views&quot; counter shown on profile pages is not
          working yet. Nothing increments it and it reads zero for everyone. We
          are not counting your visits.
        </P>
      </Section>

      <Section title="4. Why we use it">
        <UL>
          <li>
            <strong>To run your account.</strong> Signing you in, keeping you
            signed in, and letting you change your username or password. This is
            necessary to provide the service you asked for.
          </li>
          <li>
            <strong>To publish your profile.</strong> Showing your name,
            username, bio, and ranked videos to visitors, which is the entire
            point of favTube.
          </li>
          <li>
            <strong>To make the social features work.</strong> Follows,
            comments, and likes, which by their nature are visible to others.
          </li>
          <li>
            <strong>To keep favTube safe.</strong> Rate limiting, spotting
            abuse, and enforcing our <A href="/terms">terms of use</A>. This is
            our legitimate interest in running a service that is not overrun.
          </li>
        </UL>
      </Section>

      <Section title="5. YouTube and Google">
        <Callout>
          favTube uses YouTube API Services. Google&apos;s handling of any data
          it collects is governed by the{" "}
          <A href="https://policies.google.com/privacy">
            Google Privacy Policy
          </A>
          .
        </Callout>
        <P>
          There are two separate things going on here, and the difference
          matters.
        </P>
        <P>
          <strong>When you add a video</strong>, our server asks the YouTube
          Data API for that video&apos;s title, channel name, thumbnail, and
          duration, and stores them so your profile loads quickly. This request
          goes from our server to Google. It contains the video ID and our API
          key, and <strong>nothing that identifies you</strong> is sent.
        </P>
        <P>
          Google limits how long that copy may be kept to 30 days. Loading a
          profile is what enforces the limit here: when a page is viewed,
          anything cached for more than 25 days is fetched again from YouTube,
          and any video YouTube no longer serves is deleted from our database
          along with the top ten entry pointing at it. There is no background
          job doing this on a timer, so a profile that nobody opens for months
          keeps its copy until the next visit.
        </P>
        <P>
          <strong>When anyone views or plays a video</strong>, that happens
          directly between their browser and Google. Video thumbnails load from
          Google&apos;s image servers, and pressing play loads YouTube&apos;s
          embedded player. In both cases Google receives that visitor&apos;s IP
          address, browser user-agent, and the favTube page they came from, and
          may set its own cookies in their browser. This applies to every
          visitor to a public profile, whether or not they have a favTube
          account, and we cannot switch it off while still showing you videos.
        </P>
        <P>
          <strong>Revoking access.</strong> If you signed in with Google, you
          can withdraw favTube&apos;s access to your Google account at any time
          from{" "}
          <A href="https://myaccount.google.com/permissions">
            Google&apos;s permissions page
          </A>
          . Doing that stops future Google sign-ins. To remove what favTube has
          already stored, delete your account in <A href="/settings">settings</A>
          .
        </P>
      </Section>

      <Section title="6. Who else sees your data">
        <UL>
          <li>
            <strong>Neon</strong> hosts our database, which runs on Amazon Web
            Services infrastructure. Everything described in section 2 lives
            there, so Neon and AWS hold it on our behalf. Which country it sits
            in depends on the region the database was created in.
          </li>
          <li>
            <strong>Google and YouTube</strong>, as described in section 5.
          </li>
        </UL>
        <P>
          That is the entire list. We may also disclose information if we are
          legally required to, or where it is necessary to protect someone from
          harm.
        </P>
      </Section>

      <Section title="7. What is visible to everyone">
        <P>
          If your profile is public, then your name, username, bio, ranked
          videos, follower and following counts, and the full comment thread on
          your profile, including the display name of everyone who has
          commented, are visible to anyone on the internet without an account,
          and can be indexed by search engines. Your profile page also produces
          link previews containing your name and bio when shared.
        </P>
        <P>
          Two pages list public profiles without asking you. The discover page
          shows any profile that has ranked at least one video, with its name,
          username, follower count, and first four thumbnails. The homepage
          picks whichever public profile has ranked the most videos and shows it
          as an example, with its name, username, follower count, and top five
          videos.
        </P>
        <P>Your email address is never shown anywhere on favTube.</P>
        <P>
          The private toggle in <A href="/settings">settings</A> hides your
          profile from everyone but you, removes it from both of those listings,
          and asks search engines not to index it. It does not delete anything,
          and it has no effect on copies already made by search engines or other
          people.
        </P>
      </Section>

      <Section title="8. Cookies and local storage">
        <P>
          favTube sets one cookie that lasts, and it is the one that keeps you
          signed in. There are no analytics or advertising cookies, so there is
          no consent banner to click through.
        </P>
        <UL>
          <li>
            <strong>Session cookie.</strong> Holds your sign-in token. It is
            HTTP-only, meaning scripts cannot read it, and it lasts 7 days.
            Strictly necessary, because without it you cannot stay signed in.
          </li>
          <li>
            <strong>Sign-in state cookie.</strong> Set only while you are being
            sent to Google and back, to check that the reply came from the
            request you started. It holds a random value, lasts five minutes,
            and is cleared as soon as you land back on favTube.
          </li>
          <li>
            <strong>Theme preference.</strong> Whether you chose light, dark, or
            to follow your system, kept in your browser&apos;s local storage. It
            never leaves your device.
          </li>
          <li>
            <strong>Google&apos;s cookies.</strong> Set by Google, not us, when
            YouTube thumbnails and the embedded player load on pages that show
            videos. See section 5 and the{" "}
            <A href="https://policies.google.com/privacy">
              Google Privacy Policy
            </A>
            .
          </li>
        </UL>
      </Section>

      <Section title="9. How long we keep it">
        <P>
          We keep your information for as long as your account exists. Nothing
          is deleted on a schedule. A session lasts 7 days and is extended each
          day you keep using favTube, and an expired one is deleted the next
          time a browser turns up with it. Cached YouTube video information is
          refreshed or dropped when a profile is loaded, as section 5 explains.
        </P>
        <P>
          <strong>When you delete your account</strong>, from the danger zone in{" "}
          <A href="/settings">settings</A>, it happens immediately. You confirm
          by typing your username and your password, or by having signed in
          recently if you use Google. There is no grace period and no way to
          undo it. This permanently removes your user record, your sessions,
          your password hash and your Google tokens, your ranked videos, your
          follows in both directions, every comment you wrote <em>and</em> every
          comment other people left on your profile, and all your likes.
        </P>
        <P>Two things honestly do survive:</P>
        <UL>
          <li>
            Starting a Google sign-in writes a short-lived row holding a random
            token and where to send you afterwards. Finishing the sign-in
            deletes it. Abandoning it halfway leaves the row behind, where it
            stops working after ten minutes but is never swept up, and it is not
            attached to your account so deleting your account does not take it
            with you. It contains nothing that identifies you.
          </li>
          <li>
            If someone replied to one of your comments elsewhere, their reply is
            theirs and stays up. It loses the label saying who it was replying
            to.
          </li>
        </UL>
        <P>
          Backups held by our database provider may retain data for a short
          period after deletion before they age out.
        </P>
      </Section>

      <Section title="10. Your rights">
        <P>
          Wherever you live, you can ask us to give you a copy of your data,
          correct it, delete it, or stop using it in a particular way. If you
          are in the European Economic Area or the United Kingdom, those are
          your rights of access, rectification, erasure, restriction,
          portability, and objection under the GDPR, and you may also complain
          to your national data protection authority.
        </P>
        <P>Some of these you can exercise yourself, right now:</P>
        <UL>
          <li>
            <strong>Correct your details.</strong> Name, username, bio, and
            password are all editable in <A href="/settings">settings</A> and on
            your profile.
          </li>
          <li>
            <strong>Stop being public.</strong> The private toggle in settings.
          </li>
          <li>
            <strong>Delete everything.</strong> The danger zone in settings.
          </li>
        </UL>
        <P>
          <strong>There is no self-service data export yet.</strong> To get a
          copy of your data, email{" "}
          <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A> from the
          address on your account and we will send it to you. We aim to answer
          any request within 30 days, and to act on requests about YouTube data
          within 7 days, as Google requires. There is no charge.
        </P>
      </Section>

      <Section title="11. How we protect it">
        <P>
          Traffic is encrypted with HTTPS. Passwords are stored only as hashes.
          The session cookie cannot be read by scripts, sensitive actions are
          rate limited, and changing your password offers to sign out every
          other device.
        </P>
        <Callout>
          <strong>An honest limit:</strong> favTube cannot send email. If there
          were ever a breach affecting your data, we could not email you about
          it. We would post a notice on the site, and would notify the relevant
          authority where the law requires it. It is also why there is no
          password reset, as our <A href="/terms">terms of use</A> explains.
        </Callout>
      </Section>

      <Section title="12. Children">
        <P>
          favTube is not intended for children under 13, or under 16 in the
          European Economic Area and the United Kingdom, and we do not knowingly
          collect their information. If you believe a child has created an
          account, email{" "}
          <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A> and we will
          delete it.
        </P>
      </Section>

      <Section title="13. Where your data lives">
        <P>
          favTube is operated from Somaliland, and its database is hosted by
          Neon on Amazon Web Services infrastructure that is likely to be
          outside the country you live in. Using favTube means your information
          may be transferred to and stored in those countries, which may have
          different data protection laws than your own.
        </P>
      </Section>

      <Section title="14. Changes to this policy">
        <P>
          If this policy changes we will update the date at the top of the page,
          and say so on the site for anything significant. Since favTube cannot
          send email, this page is the only place such changes are announced.
        </P>
      </Section>
    </LegalPage>
  );
}
