import { useState } from 'react'
import logoUrl from '../../assets/logo.png'
import Button from '../../components/ui/Button.jsx'
import { Field, Input, Textarea } from '../../components/ui/Field.jsx'
import Icon from '../../components/ui/Icon.jsx'
import { DEFAULT_COMPANY, PRODUCT } from '../../config/company.js'
import { DEFAULT_REF_CONFIG, REFERENCE_DOC_TYPES } from '../../config/constants.js'
import { cx } from '../../lib/classNames.js'
import { formatRef, nextRefNumber } from '../../lib/refs.js'
import { normalizeReferenceMap, validateBusinessProfile, validateReferenceConfig } from '../../lib/validation.js'
import RefNumberFields from './RefNumberFields.jsx'

const STEPS = [
  {
    label: 'Business profile',
    caption: 'Company and contact details',
    title: 'Tell us about your business',
    description: 'These details appear across the workspace and on printed business documents.',
    icon: 'building-store',
  },
  {
    label: 'Document numbering',
    caption: 'Prefixes and numbering rules',
    title: 'Create your document numbering',
    description: 'Choose how each document type is numbered. JK IMS will handle the sequence from here.',
    icon: 'file-description',
  },
  {
    label: 'Review & launch',
    caption: 'Confirm and open your workspace',
    title: 'Your workspace is ready',
    description: 'Review the essentials, then launch JK IMS and start managing your business.',
    icon: 'rocket',
  },
]

export default function SetupWizard({ onDone }) {
  const [step, setStep] = useState(0)
  const [company, setCompany] = useState(DEFAULT_COMPANY)
  const [refMap, setRefMap] = useState(() =>
    Object.fromEntries(REFERENCE_DOC_TYPES.map(({ type }) => [type, DEFAULT_REF_CONFIG(type)])))
  const [errors, setErrors] = useState({})

  const set = (key) => (event) => {
    const { value } = event.target
    setCompany((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const updateReference = (type, config) => {
    setRefMap((current) => ({ ...current, [type]: config }))
    setErrors((current) => ({ ...current, [type]: undefined }))
  }

  const validateStep = () => {
    const nextErrors = step === 0
      ? validateBusinessProfile(company)
      : validateReferenceConfig(refMap)
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const next = () => {
    if (!validateStep()) return
    setStep((current) => Math.min(STEPS.length - 1, current + 1))
  }

  const launch = () => {
    const businessErrors = validateBusinessProfile(company)
    const referenceErrors = validateReferenceConfig(refMap)
    const allErrors = { ...businessErrors, ...referenceErrors }
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      setStep(Object.keys(businessErrors).length > 0 ? 0 : 1)
      return
    }
    onDone({
      ...company,
      bizName: company.bizName.trim(),
      email: company.email.trim(),
      refMap: normalizeReferenceMap(refMap),
      usedRefs: {},
    })
  }

  const currentStep = STEPS[step]
  const last = step === STEPS.length - 1
  const companyName = company.bizName.trim() || DEFAULT_COMPANY.bizName
  const referencePreview = REFERENCE_DOC_TYPES.slice(0, 4).map(({ type, label }) => ({
    label,
    value: formatRef(refMap[type], nextRefNumber(refMap[type])),
  }))

  return (
    <main className="onboarding-page">
      <div className="onboarding-shell">
        <aside className="onboarding-brand" aria-label="Setup introduction">
          <div className="onboarding-brand__orb onboarding-brand__orb--one" aria-hidden="true" />
          <div className="onboarding-brand__orb onboarding-brand__orb--two" aria-hidden="true" />

          <header className="onboarding-brand__header">
            <div className="onboarding-brand__logo">
              <img src={logoUrl} alt="" />
            </div>
            <div>
              <div className="onboarding-brand__product">{PRODUCT.name}</div>
              <div className="onboarding-brand__full-name">{PRODUCT.fullName}</div>
            </div>
          </header>

          <div className="onboarding-brand__intro">
            <span className="onboarding-brand__eyebrow">WELCOME ABOARD</span>
            <h1>Set up a workspace that works your way.</h1>
            <p>
              A few details now and {companyName} will have a polished, accounting-ready system
              from the very first document.
            </p>
          </div>

          <ol className="onboarding-progress" aria-label="Setup progress">
            {STEPS.map((item, index) => (
              <li
                key={item.label}
                className={cx(index === step && 'is-current', index < step && 'is-complete')}
                aria-current={index === step ? 'step' : undefined}
              >
                <span className="onboarding-progress__marker" aria-hidden="true">
                  {index < step ? <Icon name="check" size={15} /> : index + 1}
                </span>
                <span className="onboarding-progress__copy">
                  <strong>{item.label}</strong>
                  <small>{item.caption}</small>
                </span>
              </li>
            ))}
          </ol>

          <div className="onboarding-brand__footer">
            <span className="onboarding-brand__footer-icon">
              <Icon name="circle-check" size={20} />
            </span>
            <span>
              <strong>Your data stays with you</strong>
              <small>Stored locally in this browser and included in backups.</small>
            </span>
          </div>
        </aside>

        <section className="onboarding-panel" aria-labelledby="setup-step-title">
          <header className="onboarding-panel__header">
            <div className="onboarding-panel__meta" aria-live="polite">
              <span>STEP {step + 1} OF {STEPS.length}</span>
              <span>{currentStep.label}</span>
            </div>
            <div className="onboarding-panel__title-row">
              <span className="onboarding-panel__icon">
                <Icon name={currentStep.icon} size={23} />
              </span>
              <div>
                <h2 id="setup-step-title">{currentStep.title}</h2>
                <p>{currentStep.description}</p>
              </div>
            </div>
          </header>

          <div className="onboarding-panel__body">
            <div className="onboarding-step" key={step}>
              {step === 0 && (
                <>
                  <section className="setup-block">
                    <div className="setup-block__heading">
                      <span className="setup-block__icon"><Icon name="building-store" size={20} /></span>
                      <div>
                        <h3>Company identity</h3>
                        <p>Used on your workspace and printed documents.</p>
                      </div>
                    </div>
                    <div className="form-grid">
                      <Field label="Company Name" required error={errors.bizName} hint="You can change this later in Settings.">
                        <Input value={company.bizName} onChange={set('bizName')} />
                      </Field>
                      <Field label="KRA PIN" half>
                        <Input value={company.pin} onChange={set('pin')} />
                      </Field>
                    </div>
                  </section>

                  <section className="setup-block">
                    <div className="setup-block__heading">
                      <span className="setup-block__icon"><Icon name="users" size={20} /></span>
                      <div>
                        <h3>Contact details</h3>
                        <p>Shown in document headers and business contacts.</p>
                      </div>
                    </div>
                    <div className="form-grid">
                      <Field label="Phone" half>
                        <Input type="tel" value={company.phone} onChange={set('phone')} />
                      </Field>
                      <Field label="Email" half error={errors.email}>
                        <Input type="email" value={company.email} onChange={set('email')} />
                      </Field>
                      <Field label="Address">
                        <Textarea rows={3} value={company.address} onChange={set('address')} />
                      </Field>
                    </div>
                  </section>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="setup-callout">
                    <span className="setup-callout__icon"><Icon name="settings" size={21} /></span>
                    <div>
                      <strong>Smart sequential references</strong>
                      <p>
                        Every saved document advances the sequence automatically, so duplicate or
                        missing references are avoided.
                      </p>
                    </div>
                  </div>
                  <RefNumberFields
                    refMap={refMap}
                    errors={errors}
                    previewLabel="First reference"
                    onChange={updateReference}
                  />
                </>
              )}

              {step === 2 && (
                <div className="setup-ready">
                  <div className="setup-ready__hero">
                    <span className="setup-ready__icon"><Icon name="circle-check" size={32} /></span>
                    <div>
                      <span>CONFIGURATION COMPLETE</span>
                      <h3>Everything is ready to launch.</h3>
                      <p>Your workspace will open with these details and numbering rules.</p>
                    </div>
                  </div>

                  <div className="setup-summary-grid">
                    <section className="setup-summary-card">
                      <header>
                        <span><Icon name="building-store" size={18} /></span>
                        <div>
                          <h3>Business profile</h3>
                          <p>Your company and contact details</p>
                        </div>
                      </header>
                      <dl>
                        <div><dt>Business</dt><dd>{companyName}</dd></div>
                        <div><dt>KRA PIN</dt><dd>{company.pin || 'Not provided'}</dd></div>
                        <div><dt>Phone</dt><dd>{company.phone || 'Not provided'}</dd></div>
                        <div><dt>Email</dt><dd>{company.email || 'Not provided'}</dd></div>
                      </dl>
                    </section>

                    <section className="setup-summary-card">
                      <header>
                        <span><Icon name="file-description" size={18} /></span>
                        <div>
                          <h3>Document numbering</h3>
                          <p>{REFERENCE_DOC_TYPES.length} document types configured</p>
                        </div>
                      </header>
                      <dl>
                        {referencePreview.map((item) => (
                          <div key={item.label}><dt>{item.label}</dt><dd><code>{item.value}</code></dd></div>
                        ))}
                      </dl>
                      <footer>All remaining document types will use their default prefixes.</footer>
                    </section>
                  </div>
                </div>
              )}
            </div>
          </div>

          <footer className="onboarding-footer">
            <div className="onboarding-footer__hint">
              <Icon name="circle-check" size={16} />
              <span>Your progress is kept while you configure this workspace.</span>
            </div>
            <div className="onboarding-footer__actions">
              {step > 0 ? (
                <Button variant="secondary" icon="arrow-left" onClick={() => setStep((current) => Math.max(0, current - 1))}>
                  Back
                </Button>
              ) : <span />}
              {last ? (
                <Button variant="gold" icon="rocket" onClick={launch}>Launch {PRODUCT.name}</Button>
              ) : (
                <Button icon="arrow-right" onClick={next}>Continue</Button>
              )}
            </div>
          </footer>
        </section>
      </div>
    </main>
  )
}
