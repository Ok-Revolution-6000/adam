import {SiteBar} from './site';
/** Privacy policy and terms of service, written for what Adomeh actually does. Operator: Renaissance ML, LLC. */
const OPERATOR='Renaissance ML, LLC',CONTACT='menachemberrebi@gmail.com',UPDATED='23 September 2026';
export function Privacy(){
 return <div className="page legal">
  <SiteBar current="privacy"/>
  <div className="spread">
   <main className="sheet"><section className="sheet-section"><span className="folio">P</span>
    <p className="kicker">Privacy policy · updated {UPDATED}</p>
    <h1>Privacy</h1>
    <p className="lede">Adomeh keeps as little about you as it can: an email address, whether you are a Reader, and where you are in the texts.</p>
    <h3>Who we are</h3><p>Adomeh (adomeh.com) is operated by {OPERATOR}. Questions about this policy go to <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
    <h3>What we collect</h3><p>When you make an account we store your email address, and if you choose one, a password, which is hashed and never readable by us. If you sign in with Google, we receive your email address and name from Google and nothing else. If you subscribe, Stripe tells us that you have, when your period ends and whether a payment failed; we never see or store your card. We keep no analytics, no advertising identifiers and no tracking pixels. The server records ordinary access logs (address, time, page) for a short period to keep the service running.</p>
    <h3>Who handles it for us</h3><p>Accounts and sign-in are handled by Clerk (clerk.com). Payments and invoices are handled by Stripe (stripe.com), which is the merchant of record for your subscription. The site is hosted by Vercel and the texts are stored with Cloudflare. Each of these processes your data under its own privacy policy and only to provide its part of the service. We do not sell or share your information with anyone else.</p>
    <h3>Cookies</h3><p>Clerk sets the cookies that keep you signed in. Stripe sets its own on its checkout and billing pages. We set none of our own beyond the browser’s local storage for your reading position and preferences, which stays on your device.</p>
    <h3>Your rights</h3><p>You can see and change your email in your account, cancel your subscription in billing, and delete your account by writing to us; deleting it removes your email and subscription record from Clerk and closes your Stripe customer. Invoices are kept as long as tax law requires. Wherever you are, you may ask us what we hold about you, to correct it, or to delete it, and we will answer within thirty days.</p>
    <h3>Children</h3><p>Adomeh is not directed at children under 16, and we do not knowingly keep accounts for them.</p>
    <h3>Changes</h3><p>If this policy changes in a way that matters, we will say so on this page and, for material changes, by email to account holders.</p>
   </section></main>
   <aside className="plates is-single" aria-label="Note"><figure><div className="plate is-text"><p>“The physician must be able to tell the antecedents, know the present, and foretell the future.”</p><cite>Hippocrates, <i>Epidemics</i> I</cite></div></figure></aside>
  </div>
 </div>;
}
export function Terms(){
 return <div className="page legal">
  <SiteBar current="terms"/>
  <div className="spread">
   <main className="sheet"><section className="sheet-section"><span className="folio">T</span>
    <p className="kicker">Terms of service · updated {UPDATED}</p>
    <h1>Terms</h1>
    <p className="lede">Adomeh is a reading tool. These terms say what you may do with it and what we promise in return.</p>
    <h3>The service</h3><p>Adomeh, at adomeh.com, is operated by {OPERATOR}. It offers an anatomical atlas and a library of classical medical texts. The atlas, the Library, the Structures pages and the About page are open to everyone. Reading the texts requires an account; some texts require the Reader plan.</p>
    <h3>Accounts</h3><p>You must give a working email address and keep your sign-in to yourself. An account is for one person. We may close accounts that share access, scrape the texts or interfere with the service.</p>
    <h3>The Reader plan</h3><p>The Reader plan is a subscription of USD 30 a month or USD 248 a year, charged by Stripe at the start of each period and renewed automatically until you cancel. You can cancel at any time in billing; access continues to the end of the period already paid for, and we do not refund part periods. If a payment fails we will tell you and keep your access for a short grace period while Stripe retries. Prices may change; we will give at least thirty days’ notice by email before a change affects your renewal.</p>
    <h3>The texts</h3><p>Your account gives you a personal, non-transferable licence to read the texts on Adomeh. You may not copy, redistribute or republish them, or use them to train models, except as the licence of a particular text allows. The Hippocratic and Galenic texts come from Perseus and First1KGreek under CC BY-SA 4.0; translations made for Adomeh from those texts carry the same licence and are attributed in the reader. Other texts are used under their own terms as noted with each work. The anatomy is BodyParts3D, © The Database Center for Life Science, CC BY 4.0.</p>
    <h3>Not medical advice</h3><p>The classical notes describe medicine as it was understood centuries ago, for study. Nothing on Adomeh is medical advice, diagnosis or treatment.</p>
    <h3>Availability and liability</h3><p>We work to keep Adomeh available and its texts accurate, but we provide it as it is, without warranty. To the extent the law allows, our liability to you is limited to what you paid us in the twelve months before the claim. Nothing here limits liability that the law does not allow to be limited.</p>
    <h3>Changes and contact</h3><p>We may change these terms; material changes will be announced on this page and by email to account holders, and continuing to use Adomeh after that means you accept them. Write to <a href={`mailto:${CONTACT}`}>{CONTACT}</a> with any question.</p>
    <dl className="ledger"><div><dt>Privacy policy</dt><dd><a href="#/privacy">adomeh.com/privacy</a></dd></div><div><dt>Attribution</dt><dd><a href="/ATTRIBUTION.md" target="_blank" rel="noreferrer">ATTRIBUTION.md</a></dd></div></dl>
   </section></main>
   <aside className="plates is-single" aria-label="Note"><figure><div className="plate is-text"><p>“Life is short, the art long, opportunity fleeting, experiment perilous, judgement difficult.”</p><cite>Hippocrates, <i>Aphorisms</i> I.1</cite></div></figure></aside>
  </div>
 </div>;
}
