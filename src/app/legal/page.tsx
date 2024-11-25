'use client';

import { useTheme } from '@context/ThemeProvider';

export default function LegalPage() {
  const { theme } = useTheme();

  return (
    <div className="h-full overflow-y-auto">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Privacy Policy and Terms of Service</h1>
        
        <div className="space-y-8 max-w-4xl mx-auto">
          <section id="privacy-policy" className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-6`}>
            <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
            <div className="space-y-4">
              <p><strong>Introduction:</strong> This Privacy Policy explains how ThecAI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) collects, uses, and protects your personal information when you use our web application. Your privacy is a priority, and we strive to handle any collected data with transparency and responsibility.</p>

              <h3 className="text-xl font-semibold mt-4 mb-2">What We Collect:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Vehicle Information:</strong> If you save your vehicle details (make, model, year), they are stored to provide quick access to relevant maintenance information.</li>
                <li><strong>Usage Data:</strong> We gather data on how you interact with the app (e.g., selected topics, browsing history) to enhance your experience. This data is limited to your interactions within the app.</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">How We Use Your Data:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>To Personalize Service:</strong> Vehicle details help us provide relevant content tailored to your needs.</li>
                <li><strong>Communication:</strong> We may send updates about major changes to the app or respond to queries, if you provide your contact information for support purposes.</li>
              </ul>

              <p><strong>Data Retention:</strong> Saved vehicle details are stored to improve your experience. You may remove this data at any time by contacting us directly.</p>

              <p><strong>Third-Party Services:</strong> We do not share your personal information with third parties, except for analytics services like Google Analytics. These tools help us understand user behavior in an anonymized way to improve the app&apos;s functionality.</p>

              <p><strong>Data Security:</strong> We use industry-standard encryption to protect your information. However, no system is entirely secure, and we cannot guarantee absolute protection against data breaches.</p>

              <h3 className="text-xl font-semibold mt-4 mb-2">Your Rights:</h3>
              <p>You have the right to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Access the data we collect about you.</li>
                <li>Delete your saved vehicle details.</li>
                <li>Update your information if needed.</li>
              </ul>
              <p>To exercise these rights, contact us at [your email address].</p>
            </div>
          </section>

          <section id="terms-of-service" className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-6`}>
            <h2 className="text-2xl font-semibold mb-4">Terms of Service</h2>
            <div className="space-y-4">
              <p><strong>Introduction:</strong> By using ThecAI, you agree to comply with these Terms of Service. These terms outline your responsibilities, our service limitations, and the intellectual property considerations involved.</p>

              <h3 className="text-xl font-semibold mt-4 mb-2">User Responsibilities:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Fact-Checking:</strong> ThecAI provides information for guidance and educational purposes only. Users must cross-check the information with official sources or consult a professional mechanic.</li>
                <li><strong>Personal Use:</strong> The app is intended for personal use only. Users are responsible for keeping their vehicle information accurate.</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">Service Availability:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>No Guarantees:</strong> We aim to ensure consistent service but cannot guarantee that ThecAI will always be available without interruptions. We are not responsible for data loss or downtime.</li>
                <li><strong>Maintenance & Updates:</strong> We may occasionally perform maintenance or updates that could temporarily affect the app&apos;s availability.</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">Intellectual Property Disclaimer:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>No Ownership of External Content:</strong> ThecAI does not claim ownership of any third-party content referenced in the app (e.g., diagrams, technical specifications). This information is derived from publicly available sources, such as car manuals, and remains the property of the respective owners.</li>
                <li><strong>Service Credit:</strong> ThecAI organizes publicly available content into a user-friendly format for easy access but does not claim authorship of the technical information presented.</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">Liability Disclaimer:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>No Warranty:</strong> ThecAI provides content &quot;as is&quot; without any warranties. We do not guarantee the accuracy or completeness of the information provided.</li>
                <li><strong>User Responsibility:</strong> Users are solely responsible for how they use the information. ThecAI is not liable for damages, loss, or injury resulting from the use of the content provided.</li>
              </ul>

              <p><strong>Changes to the Terms:</strong> We reserve the right to update these Terms of Service. Users will be notified of any changes, and continued use of the app constitutes acceptance of the revised terms.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}