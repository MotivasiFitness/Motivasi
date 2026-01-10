import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Ear, Keyboard, Zap } from 'lucide-react';

export default function AccessibilityPage() {
  const sections = [
    { id: 'commitment', title: 'Our Commitment' },
    { id: 'wcag-compliance', title: 'WCAG Compliance' },
    { id: 'features', title: 'Accessibility Features' },
    { id: 'keyboard-navigation', title: 'Keyboard Navigation' },
    { id: 'screen-readers', title: 'Screen Reader Support' },
    { id: 'color-contrast', title: 'Color Contrast' },
    { id: 'known-issues', title: 'Known Issues' },
    { id: 'feedback', title: 'Accessibility Feedback' },
  ];

  return (
    <div className="bg-soft-white">
      {/* Header */}
      <section className="py-16 px-8 lg:px-20 bg-warm-sand-beige">
        <div className="max-w-[100rem] mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-soft-bronze font-paragraph text-base hover:underline mb-8"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-charcoal-black mb-4">
            Accessibility Statement
          </h1>
          <p className="font-paragraph text-lg text-charcoal-black">
            Our commitment to making Motivasi accessible to everyone
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-8 lg:px-20">
        <div className="max-w-[100rem] mx-auto grid lg:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-soft-white border border-warm-sand-beige rounded-2xl p-6">
              <h3 className="font-heading text-lg font-bold text-charcoal-black mb-6">
                Contents
              </h3>
              <nav className="space-y-3">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block font-paragraph text-sm text-warm-grey hover:text-soft-bronze transition-colors"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Commitment */}
            <section id="commitment" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Our Commitment to Accessibility
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  Motivasi is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying relevant accessibility standards.
                </p>
                <p>
                  This accessibility statement applies to www.motivasi.co.uk and all associated pages, services, and digital content provided by Motivasi.
                </p>
              </div>
            </section>

            {/* WCAG Compliance */}
            <section id="wcag-compliance" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                WCAG 2.1 Compliance
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  Motivasi aims to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards published by the World Wide Web Consortium (W3C). These guidelines explain how to make web content more accessible to people with disabilities.
                </p>
                <p>
                  <span className="font-bold text-charcoal-black">WCAG 2.1 covers three levels of conformance:</span>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><span className="font-bold text-charcoal-black">Level A:</span> The minimum level of accessibility</li>
                  <li><span className="font-bold text-charcoal-black">Level AA:</span> Enhanced accessibility for a wider audience (our target)</li>
                  <li><span className="font-bold text-charcoal-black">Level AAA:</span> The highest level of accessibility</li>
                </ul>
                <p>
                  We strive to meet Level AA standards across all pages and content on our website.
                </p>
              </div>
            </section>

            {/* Accessibility Features */}
            <section id="features" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Accessibility Features
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
                  <div className="flex gap-4 mb-4">
                    <Eye className="w-6 h-6 text-soft-bronze flex-shrink-0" />
                    <h3 className="font-heading text-xl font-bold text-charcoal-black">
                      Visual Accessibility
                    </h3>
                  </div>
                  <ul className="space-y-3 font-paragraph text-sm text-warm-grey">
                    <li>✓ High contrast text and backgrounds</li>
                    <li>✓ Resizable text and scalable content</li>
                    <li>✓ Clear visual hierarchy</li>
                    <li>✓ Descriptive alt text for all images</li>
                    <li>✓ No content conveyed by color alone</li>
                  </ul>
                </div>

                <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
                  <div className="flex gap-4 mb-4">
                    <Keyboard className="w-6 h-6 text-soft-bronze flex-shrink-0" />
                    <h3 className="font-heading text-xl font-bold text-charcoal-black">
                      Navigation
                    </h3>
                  </div>
                  <ul className="space-y-3 font-paragraph text-sm text-warm-grey">
                    <li>✓ Full keyboard navigation support</li>
                    <li>✓ Visible focus indicators</li>
                    <li>✓ Logical tab order</li>
                    <li>✓ Skip navigation links</li>
                    <li>✓ Clear page structure and headings</li>
                  </ul>
                </div>

                <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
                  <div className="flex gap-4 mb-4">
                    <Ear className="w-6 h-6 text-soft-bronze flex-shrink-0" />
                    <h3 className="font-heading text-xl font-bold text-charcoal-black">
                      Audio & Video
                    </h3>
                  </div>
                  <ul className="space-y-3 font-paragraph text-sm text-warm-grey">
                    <li>✓ Captions for video content</li>
                    <li>✓ Transcripts for audio content</li>
                    <li>✓ Audio descriptions where applicable</li>
                    <li>✓ Controls for auto-playing content</li>
                  </ul>
                </div>

                <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
                  <div className="flex gap-4 mb-4">
                    <Zap className="w-6 h-6 text-soft-bronze flex-shrink-0" />
                    <h3 className="font-heading text-xl font-bold text-charcoal-black">
                      Technical
                    </h3>
                  </div>
                  <ul className="space-y-3 font-paragraph text-sm text-warm-grey">
                    <li>✓ Semantic HTML structure</li>
                    <li>✓ ARIA labels and roles</li>
                    <li>✓ Form labels and error messages</li>
                    <li>✓ Mobile-responsive design</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Keyboard Navigation */}
            <section id="keyboard-navigation" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Keyboard Navigation
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  Our website is fully navigable using the keyboard. You can:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><span className="font-bold text-charcoal-black">Tab:</span> Move forward through interactive elements</li>
                  <li><span className="font-bold text-charcoal-black">Shift + Tab:</span> Move backward through interactive elements</li>
                  <li><span className="font-bold text-charcoal-black">Enter:</span> Activate buttons and links</li>
                  <li><span className="font-bold text-charcoal-black">Space:</span> Activate buttons and checkboxes</li>
                  <li><span className="font-bold text-charcoal-black">Arrow Keys:</span> Navigate within menus and dropdowns</li>
                  <li><span className="font-bold text-charcoal-black">Escape:</span> Close modals and menus</li>
                </ul>
                <p>
                  All interactive elements have visible focus indicators so you can see which element is currently selected.
                </p>
              </div>
            </section>

            {/* Screen Readers */}
            <section id="screen-readers" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Screen Reader Support
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  Our website is compatible with popular screen readers including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>NVDA (NonVisual Desktop Access) - Windows</li>
                  <li>JAWS (Job Access With Speech) - Windows</li>
                  <li>VoiceOver - macOS and iOS</li>
                  <li>TalkBack - Android</li>
                </ul>
                <p>
                  We use semantic HTML and ARIA labels to ensure screen readers can properly interpret our content. All images have descriptive alt text, and form fields are properly labeled.
                </p>
              </div>
            </section>

            {/* Color Contrast */}
            <section id="color-contrast" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Color Contrast
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  We maintain sufficient color contrast ratios throughout our website to ensure readability for people with low vision or color blindness. Our text and interactive elements meet or exceed WCAG AA standards for contrast ratios:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><span className="font-bold text-charcoal-black">Normal text:</span> Minimum 4.5:1 contrast ratio</li>
                  <li><span className="font-bold text-charcoal-black">Large text:</span> Minimum 3:1 contrast ratio</li>
                  <li><span className="font-bold text-charcoal-black">UI components:</span> Minimum 3:1 contrast ratio</li>
                </ul>
              </div>
            </section>

            {/* Known Issues */}
            <section id="known-issues" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Known Accessibility Issues
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  We are aware of the following accessibility limitations and are working to address them:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Some embedded third-party content (e.g., payment processors) may have limited accessibility features</li>
                  <li>Video content may not have captions in all cases (we are working to add these)</li>
                  <li>Some PDF documents may not be fully accessible (we are converting to accessible formats)</li>
                </ul>
                <p>
                  If you encounter any accessibility barriers, please let us know so we can work to resolve them.
                </p>
              </div>
            </section>

            {/* Feedback */}
            <section id="feedback" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Accessibility Feedback
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  We welcome feedback on the accessibility of our website. If you encounter any accessibility barriers or have suggestions for improvement, please contact us:
                </p>
                <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-2xl p-8">
                  <p className="font-paragraph text-base text-charcoal-black mb-4">
                    <span className="font-bold">Email:</span>
                  </p>
                  <a
                    href="mailto:hello@motivasi.co.uk?subject=Accessibility%20Feedback"
                    className="text-soft-bronze hover:underline font-medium text-lg"
                  >
                    hello@motivasi.co.uk
                  </a>
                  <p className="font-paragraph text-sm text-warm-grey mt-4">
                    Please include details about the accessibility issue you encountered and any suggestions for improvement. We aim to respond to all accessibility feedback within 5 business days.
                  </p>
                </div>
              </div>
            </section>

            {/* Additional Resources */}
            <section className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Additional Resources
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  For more information about web accessibility, visit:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>
                    <a href="https://www.w3.org/WAI/" target="_blank" rel="noopener noreferrer" className="text-soft-bronze hover:underline">
                      W3C Web Accessibility Initiative (WAI)
                    </a>
                  </li>
                  <li>
                    <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer" className="text-soft-bronze hover:underline">
                      WCAG 2.1 Quick Reference
                    </a>
                  </li>
                  <li>
                    <a href="https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites-and-apps" target="_blank" rel="noopener noreferrer" className="text-soft-bronze hover:underline">
                      UK Public Sector Accessibility Requirements
                    </a>
                  </li>
                </ul>
              </div>
            </section>

            {/* Final CTA */}
            <section className="mt-16 pt-12 border-t border-warm-sand-beige">
              <div className="bg-charcoal-black text-soft-white rounded-2xl p-8 md:p-12 text-center">
                <h2 className="font-heading text-3xl font-bold mb-4">
                  Need Help?
                </h2>
                <p className="font-paragraph text-lg text-warm-grey mb-8">
                  If you have any questions about accessibility or need assistance, please don't hesitate to contact us.
                </p>
                <a
                  href="mailto:hello@motivasi.co.uk"
                  className="inline-block bg-soft-bronze text-soft-white px-10 py-4 rounded-lg font-medium text-lg hover:bg-soft-white hover:text-charcoal-black transition-colors"
                >
                  Contact Us
                </a>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
