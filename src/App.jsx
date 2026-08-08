import { useMemo, useState } from 'react'
import { Activity, Archive, ArrowDownToLine, BarChart3, Bell, CalendarCheck, Camera, Check, ChevronDown, CircleDollarSign, ClipboardCheck, Crown, Database, Eye, FileText, LayoutDashboard, Menu, MessageCircle, Moon, MoreHorizontal, Plus, RotateCcw, Search, Settings, ShieldCheck, Sun, Users, X } from 'lucide-react'
import './App.css'

const seedStudents = [
  { id: 1, reg: 'REG024', name: 'Aarav Mehta', age: 13, parent: 'Sanjay Mehta', mobile: '98765 43210', school: 'St. Xavier\'s', slot: '6:00 AM', plan: '6 Months', status: 'Active', due: 'Aug 01', fee: 'Paid', attendance: 92, avatar: 'AM' },
  { id: 2, reg: 'REG023', name: 'Vihaan Shah', age: 11, parent: 'Nisha Shah', mobile: '98765 43822', school: 'DPS North', slot: '5:00 PM', plan: 'Monthly', status: 'Active', due: 'Jul 26', fee: 'Due', attendance: 88, avatar: 'VS' },
  { id: 3, reg: 'REG022', name: 'Arjun Nair', age: 15, parent: 'Ravi Nair', mobile: '98765 43941', school: 'Delhi Public School', slot: '6:00 AM', plan: '12 Months', status: 'Paused', due: 'Sep 10', fee: 'Paid', attendance: 76, avatar: 'AN' },
  { id: 4, reg: 'REG021', name: 'Kabir Kapoor', age: 12, parent: 'Mohan Kapoor', mobile: '98765 42291', school: 'Modern School', slot: '5:00 PM', plan: '3 Months', status: 'Active', due: 'Jul 30', fee: 'Due', attendance: 95, avatar: 'KK' },
  { id: 5, reg: 'REG020', name: 'Ishaan Gupta', age: 14, parent: 'Sonia Gupta', mobile: '98765 42709', school: 'Springdales', slot: '7:00 AM', plan: 'Special Training', status: 'Discontinued', due: '-', fee: 'Paid', attendance: 61, avatar: 'IG' },
]
const navItems = [['Overview', LayoutDashboard], ['Admissions', ClipboardCheck], ['Attendance', CalendarCheck], ['Roster', Users], ['Renewals', Bell], ['Fees & Ledger', CircleDollarSign], ['Jersey Orders', Crown], ['Cricket Nets', Activity], ['WhatsApp Center', MessageCircle], ['Timeline', FileText], ['Reports', BarChart3], ['Users', ShieldCheck], ['Backup & Restore', Database]]
const tone = (value) => value.toLowerCase().replaceAll(' ', '-')
const Status = ({ children }) => <span className={`status ${tone(children)}`}>{children}</span>
const Avatar = ({ student }) => <div className="avatar student">{student.avatar}</div>
const genderOptions = ['Select', 'Male', 'Female', 'Other']
const slotOptions = ['Select Slot', '6:00 AM', '7:00 AM', '4:00 PM', '5:00 PM', '6:00 PM']
const planOptions = ['Select', 'Monthly', '3 Months (5% discount)', '6 Months (10% discount)', 'Yearly (12% discount)', 'Special Training', 'Special Training 3 Months (5% discount)', 'Special Training 6 Months (10% discount)', 'Special Training Yearly (12% discount)', 'Custom Plan']
const jerseySizeOptions = ['Select Size', 'Size 22', 'Size 24', 'Size 26', 'Size 28', 'Size 30', 'Size 32', 'Size 34', 'Size 36', 'Size 38', 'Small', 'Medium', 'Large', 'X Large']
const kitTypeOptions = ['Full Kit (Shirt + Pant)', 'Only Shirt', 'Only Pant']
const feePaidOptions = ['Select', 'Yes', 'No']
const planFees = {
  Monthly: 3500,
  '3 Months (5% discount)': Math.round(3500 * 3 * 0.95),
  '6 Months (10% discount)': Math.round(3500 * 6 * 0.9),
  'Yearly (12% discount)': Math.round(3500 * 12 * 0.88),
  'Special Training': 10000,
  'Special Training 3 Months (5% discount)': Math.round(10000 * 3 * 0.95),
  'Special Training 6 Months (10% discount)': Math.round(10000 * 6 * 0.9),
  'Special Training Yearly (12% discount)': Math.round(10000 * 12 * 0.88),
}
function calculateAge(dob) {
  if (!dob) return ''
  const birthDate = new Date(dob)
  if (Number.isNaN(birthDate.getTime())) return ''
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age -= 1
  return age >= 0 ? age : ''
}

function App() {
  const [section, setSection] = useState('Overview')
  const [students, setStudents] = useState(seedStudents)
  const [dark, setDark] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [attendance, setAttendance] = useState({})
  const [events, setEvents] = useState([
    { label: 'Kabir Kapoor fee reminder scheduled', time: '12 minutes ago', icon: Bell },
    { label: 'Aarav Mehta attendance marked Present', time: '32 minutes ago', icon: CalendarCheck },
    { label: 'Vihaan Shah monthly plan due', time: 'Today, 9:00 AM', icon: CircleDollarSign },
  ])
  const filteredStudents = useMemo(() => students.filter((student) => [student.name, student.reg, student.parent, student.mobile, student.school].join(' ').toLowerCase().includes(search.toLowerCase())), [students, search])
  const activeCount = students.filter((student) => student.status === 'Active').length
  const dueCount = students.filter((student) => student.fee === 'Due').length
  const audit = (label, icon = Activity) => setEvents((current) => [{ label, time: 'Just now', icon }, ...current])
  const guarded = (action) => editMode ? action() : setModal({ type: 'guard' })
  const updateStudent = (id, patch, note) => guarded(() => {
    const student = students.find((entry) => entry.id === id)
    setStudents((records) => records.map((entry) => entry.id === id ? { ...entry, ...patch } : entry))
    audit(`${student.name} ${note}`)
  })
  const reviewStudent = (id, patch, note) => {
    const student = students.find((entry) => entry.id === id)
    setStudents((records) => records.map((entry) => entry.id === id ? { ...entry, ...patch } : entry))
    audit(`${student.name} ${note}`)
  }
  const submitAdmission = (formData, total) => {
    const reg = `GA${String(students.length + 20).padStart(3, '0')}`
    const initials = (formData.name || 'NA').trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'NA'
    const student = { id: Date.now(), reg, name: formData.name || 'Unnamed student', age: calculateAge(formData.dob) || '-', parent: formData.parentMobile, mobile: formData.parentMobile, school: formData.school, slot: formData.slot, plan: formData.plan, status: 'Pending', due: formData.joiningDate, fee: 'Due', attendance: 0, avatar: initials, admission: { ...formData } }
    setStudents((records) => [student, ...records])
    audit(`${student.name} submitted a new admission application · Total due ₹${total.toLocaleString('en-IN')}`, ClipboardCheck)
  }
  const content = () => {
    if (section === 'Admissions') return <Admissions onSubmit={submitAdmission} />
    if (section === 'Attendance') return <Attendance students={students.filter((student) => student.status === 'Active')} attendance={attendance} setAttendance={setAttendance} guarded={guarded} audit={audit} />
    if (section === 'Roster') return <Roster students={filteredStudents} updateStudent={updateStudent} setModal={setModal} />
    if (section === 'Fees & Ledger') return <Fees students={students} updateStudent={updateStudent} />
    if (section === 'Renewals') return <Renewals students={students} updateStudent={updateStudent} />
    if (section === 'Timeline') return <Timeline events={events} />
    if (section === 'Cricket Nets') return <Nets guarded={guarded} audit={audit} />
    if (section === 'Jersey Orders') return <Jerseys guarded={guarded} audit={audit} />
    if (section === 'WhatsApp Center') return <WhatsApp />
    if (section === 'Reports') return <Reports students={students} />
    if (section === 'Users') return <UserManagement guarded={guarded} audit={audit} />
    if (section === 'Backup & Restore') return <Backup guarded={guarded} audit={audit} />
    return <Overview activeCount={activeCount} dueCount={dueCount} events={events} setSection={setSection} />
  }
  return <div className={`app ${dark ? 'dark' : ''}`}>
    <aside className={`sidebar ${navOpen ? 'open' : ''}`}><div className="brand"><AcademyLogo size={34} /><div><b>Gen Alpha</b><span>Cricket Academy</span></div><button className="icon-button close-nav" onClick={() => setNavOpen(false)}><X size={18} /></button></div><nav>{navItems.map(([label, Icon]) => <button className={section === label ? 'active' : ''} key={label} onClick={() => { setSection(label); setNavOpen(false) }}><Icon size={18} />{label}{label === 'Renewals' && <em>4</em>}</button>)}</nav><div className="sidebar-bottom"><div className="help"><Settings size={17} /> Settings</div><div className="operator"><div className="avatar teal">PS</div><div><b>Priya Sharma</b><span>Academy Manager</span></div><ChevronDown size={15} /></div></div></aside>
    <main><header className="topbar"><button className="icon-button mobile-menu" onClick={() => setNavOpen(true)}><Menu size={20} /></button><div className="global-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students, registrations, parents..." /><kbd>CTRL K</kbd></div><div className="top-actions"><button className="icon-button" onClick={() => setDark(!dark)} title="Toggle theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button><button className={`edit-toggle ${editMode ? 'enabled' : ''}`} onClick={() => setEditMode(!editMode)}><span></span>{editMode ? 'Edit mode on' : 'Edit mode'}</button><div className="role-badge"><ShieldCheck size={14} /> MANAGEMENT</div><div className="avatar">PS</div></div></header><section className="page">{content()}</section></main>
    {modal && <Modal modal={modal} close={() => setModal(null)} reviewStudent={reviewStudent} />}
  </div>
}

function PageTitle({ eyebrow, title, children }) { return <div className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div>{children}</div> }
function Kpi({ label, value, trend, Icon, color }) { return <article className="kpi"><div className={`metric-icon ${color}`}><Icon size={19} /></div><span>{label}</span><strong>{value}</strong><small>{trend}</small></article> }
function Overview({ activeCount, dueCount, events, setSection }) { return <><PageTitle eyebrow="Wednesday, July 23" title="Good morning, Priya."><button className="primary" onClick={() => setSection('Admissions')}><Plus size={17} /> New admission</button></PageTitle><div className="kpis"><Kpi label="Active students" value={activeCount} trend="+3 this month" Icon={Users} color="blue" /><Kpi label="Attendance today" value="87%" trend="46 of 53 present" Icon={CalendarCheck} color="green" /><Kpi label="Pending collections" value={`₹${dueCount * 1800},400`} trend={`${dueCount} accounts due`} Icon={CircleDollarSign} color="orange" /><Kpi label="Renewals due" value="4" trend="Next in 3 days" Icon={Bell} color="rose" /></div><div className="dashboard-grid"><section className="panel chart-panel"><div className="panel-head"><div><h2>Attendance pulse</h2><span>Last 7 training days</span></div><button className="text-button" onClick={() => setSection('Attendance')}>View analytics</button></div><div className="chart"><div className="chart-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span></div><div className="bars">{[68, 82, 74, 91, 87, 84, 87].map((height, index) => <div key={index}><i style={{ height: `${height}%` }}></i><span>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</span></div>)}</div></div></section><section className="panel activity-panel"><div className="panel-head"><div><h2>Live activity</h2><span>Academy activity feed</span></div><button className="text-button" onClick={() => setSection('Timeline')}>Full timeline</button></div><TimelineItems events={events.slice(0, 4)} /></section></div><section className="panel roster-preview"><div className="panel-head"><div><h2>Attention needed</h2><span>Items requiring action today</span></div><button className="text-button" onClick={() => setSection('Renewals')}>Open renewals</button></div><div className="attention-list"><Attention title="2 fee collections are overdue" note="Vihaan Shah and Kabir Kapoor have unpaid monthly fees." action="Review fees" /><Attention title="4 renewals approaching" note="Plans expiring in the next 14 days." action="Review admission" /><Attention title="New admissions awaiting review" note="Check the Admissions module for newly submitted applications." action="Review admission" /></div></section></> }
function Attention({ title, note, action }) { return <div className="attention"><div><b>{title}</b><span>{note}</span></div><button className="outline">{action}</button></div> }
function AcademyLogo({ size = 40 }) {
  const [broken, setBroken] = useState(false)
  if (broken) return <div className="logo-fallback" style={{ width: size, height: size, fontSize: size * 0.36 }}>GA</div>
  return <img src="/logo.png" alt="Gen Alpha Cricket Academy" className="logo-image" style={{ width: size, height: size }} onError={() => setBroken(true)} />
}

function AdmissionLetterhead() {
  return <header className="academy-letterhead"><div className="letterhead-spacer" aria-hidden="true"></div><div className="letterhead-title"><h1>Gen Alpha Cricket Academy</h1></div><div className="letterhead-logo"><AcademyLogo size={54} /></div></header>
}

function Admissions({ onSubmit }) {
  const emptyForm = {
    photo: null, name: '', dob: '', gender: 'Select', school: '', grade: '', guardianName: '', parentMobile: '', altMobile: '', address: '',
    slot: 'Select Slot', joiningDate: new Date().toISOString().slice(0, 10), plan: 'Select', fee: 0, admissionFee: 0, feePaid: 'Select',
    jerseyEnabled: false, jerseyName: '', jerseySize: 'Select Size', jerseyPairs: 1, kitType: kitTypeOptions[0], jerseyAmount: 0, comments: '',
  }
  const [form, setForm] = useState(emptyForm)
  const [confirmation, setConfirmation] = useState('')
  const age = calculateAge(form.dob)
  const field = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  const handlePlanChange = (event) => {
    const plan = event.target.value
    setForm((current) => ({ ...current, plan, fee: planFees[plan] ?? 0, admissionFee: plan === 'Select' ? 0 : 500 }))
  }
  const handlePhoto = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm((current) => ({ ...current, photo: reader.result }))
    reader.readAsDataURL(file)
  }
  const totalAmount = (Number(form.fee) || 0) + (Number(form.admissionFee) || 0) + (form.jerseyEnabled ? (Number(form.jerseyAmount) || 0) : 0)
  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(form, totalAmount)
    setConfirmation(`Admission submitted for ${form.name || 'the student'}. Total amount ₹${totalAmount.toLocaleString('en-IN')} recorded as pending.`)
    setForm(emptyForm)
  }
  const handleCancel = () => { setForm(emptyForm); setConfirmation('') }
  return <>
    <AdmissionLetterhead />
    <PageTitle eyebrow="Admissions" title="New admission form"><button type="button" className="outline" onClick={() => setForm(emptyForm)}><RotateCcw size={15} /> Reset form</button></PageTitle>
    {confirmation && <div className="form-confirmation"><Check size={15} /> {confirmation}</div>}
    <form className="panel admission-form" onSubmit={handleSubmit}>
      <section className="form-section">
        <h2>Student details</h2>
        <div className="student-detail-block">
          <div className="form-grid student-fields">
            <div className="field"><label>Student Name</label><input required value={form.name} onChange={field('name')} placeholder="Student full name" /></div>
            <div className="field"><label>Date of birth</label><input type="date" required value={form.dob} onChange={field('dob')} /></div>
            <div className="field compact"><label>Age</label><input value={age} disabled placeholder="Auto" /></div>
            <div className="field compact"><label>Gender</label><select value={form.gender} onChange={field('gender')}>{genderOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
            <div className="field"><label>School Name</label><input value={form.school} onChange={field('school')} /></div>
            <div className="field"><label>Grade</label><input value={form.grade} onChange={field('grade')} /></div>
          </div>
          <div className="field photo-field"><label>Photo</label><div className="photo-upload">{form.photo ? <img src={form.photo} alt="Student" /> : <div className="photo-placeholder"><Camera size={20} /></div>}<label className="outline photo-button">Upload<input type="file" accept="image/*" onChange={handlePhoto} hidden /></label></div></div>
        </div>
      </section>
      <section className="form-section">
        <h2>Parent & contact</h2>
        <div className="form-grid">
          <div className="field"><label>Parent/Guardian Name</label><input value={form.guardianName} onChange={field('guardianName')} /></div>
          <div className="field"><label>Parent mobile</label><input required value={form.parentMobile} onChange={field('parentMobile')} /></div>
          <div className="field"><label>Alternate mobile</label><input value={form.altMobile} onChange={field('altMobile')} /></div>
          <div className="field full"><label>Address</label><textarea rows={2} value={form.address} onChange={field('address')} /></div>
        </div>
      </section>
      <section className="form-section">
        <h2>Batch details</h2>
        <div className="form-grid">
          <div className="field"><label>Batch Timing</label><select value={form.slot} onChange={field('slot')}>{slotOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
          <div className="field"><label>Joining date</label><input type="date" value={form.joiningDate} onChange={field('joiningDate')} /></div>
          <div className="field"><label>Plan</label><select value={form.plan} onChange={handlePlanChange}>{planOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
          <div className="field"><label>Fee (₹)</label><input type="number" min="0" value={form.fee} onChange={field('fee')} /></div>
          <div className="field"><label>Admission fee (₹)</label><input type="number" min="0" value={form.admissionFee} onChange={field('admissionFee')} /></div>
          <div className="field"><label>Fee Paid</label><select value={form.feePaid} onChange={field('feePaid')}>{feePaidOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
        </div>
      </section>
      <section className="form-section">
        <div className="jersey-head"><h2>Jersey Section</h2><div className="segmented">{['No', 'Yes'].map((option) => <button type="button" key={option} className={(option === 'Yes') === form.jerseyEnabled ? 'active' : ''} onClick={() => setForm((current) => ({ ...current, jerseyEnabled: option === 'Yes' }))}>{option}</button>)}</div></div>
        {form.jerseyEnabled && <div className="form-grid">
          <div className="field"><label>Name on jersey</label><input value={form.jerseyName} onChange={field('jerseyName')} /></div>
          <div className="field"><label>Jersey size</label><select value={form.jerseySize} onChange={field('jerseySize')}>{jerseySizeOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
          <div className="field"><label>No. of Pairs</label><input type="number" min="1" value={form.jerseyPairs} onChange={field('jerseyPairs')} /></div>
          <div className="field"><label>Kit Type</label><select value={form.kitType} onChange={field('kitType')}>{kitTypeOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
          <div className="field"><label>Amount (₹)</label><input type="number" min="0" value={form.jerseyAmount} onChange={field('jerseyAmount')} /></div>
        </div>}
      </section>
      <section className="form-section">
        <h2>Comments / Special Request</h2>
        <div className="form-grid"><div className="field full"><label>Comments / Special Request</label><textarea rows={3} value={form.comments} onChange={field('comments')} /></div></div>
      </section>
      <div className="admission-summary">
        <div><span>Plan fee</span><b>₹{(Number(form.fee) || 0).toLocaleString('en-IN')}</b></div>
        <div><span>Admission fee</span><b>₹{(Number(form.admissionFee) || 0).toLocaleString('en-IN')}</b></div>
        <div><span>Jersey amount</span><b>₹{(form.jerseyEnabled ? Number(form.jerseyAmount) || 0 : 0).toLocaleString('en-IN')}</b></div>
        <div className="total"><span>Total amount</span><b>₹{totalAmount.toLocaleString('en-IN')}</b></div>
      </div>
      <div className="admission-actions"><button type="button" className="outline" onClick={handleCancel}>Cancel</button><button type="submit" className="primary"><Check size={16} /> Submit admission</button></div>
    </form>
  </>
}
function Attendance({ students, attendance, setAttendance, guarded, audit }) { const mark = (id, value) => guarded(() => { setAttendance({ ...attendance, [id]: value }); audit(`${students.find((student) => student.id === id).name} marked ${value}`, CalendarCheck) }); return <><PageTitle eyebrow="Attendance" title="Daily register"><div className="date-select"><ChevronDown size={15} /> Today, Jul 23</div></PageTitle><div className="attendance-stats"><span><b>46</b> Present</span><span><b>5</b> Absent</span><span><b>2</b> Late</span><span><b>87%</b> Daily attendance</span></div><section className="panel"><div className="panel-head"><div><h2>Morning & evening batches</h2><span>Mark the register for today</span></div><button className="outline">Bulk mark present</button></div><div className="table-wrap"><table><thead><tr><th>Student</th><th>Slot</th><th>Plan</th><th>Current streak</th><th>Status</th></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td><div className="person"><Avatar student={student} /><div><b>{student.name}</b><span>{student.reg}</span></div></div></td><td>{student.slot}</td><td>{student.plan}</td><td>{student.attendance > 90 ? '12 days' : '5 days'}</td><td><div className="attendance-actions">{['Present', 'Late', 'Absent'].map((state) => <button className={attendance[student.id] === state ? tone(state) : ''} key={state} onClick={() => mark(student.id, state)}>{state}</button>)}</div></td></tr>)}</tbody></table></div></section></> }
function Roster({ students, updateStudent, setModal }) {
  const pendingAdmission = students.find((student) => student.status === 'Pending')
  return <><PageTitle eyebrow="Students" title="Academy roster"><button className="primary" onClick={() => setModal({ type: 'student' })}><Plus size={17} /> Add student</button></PageTitle>
    {pendingAdmission && <div className="roster-notification"><Bell size={17} /><div className="grow"><b>New admission for approval</b><span>{pendingAdmission.name} · {pendingAdmission.reg} is awaiting review</span></div><button className="primary small" onClick={() => setModal({ type: 'admission-review', student: pendingAdmission })}>Review</button></div>}
    <div className="filters"><button><Search size={15} /> Search roster</button><button>All slots <ChevronDown size={14} /></button><button>All plans <ChevronDown size={14} /></button><button>All statuses <ChevronDown size={14} /></button><button className="filter-clear">Clear filters</button></div><section className="panel"><div className="panel-head"><div><h2>{students.length} students</h2><span>Roster, renewals & student lifecycle</span></div><button className="icon-button"><MoreHorizontal size={19} /></button></div><div className="table-wrap"><table><thead><tr><th>Student</th><th>Slot</th><th>Plan</th><th>Fee status</th><th>Renewal</th><th>Status</th><th></th></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td><div className="person"><Avatar student={student} /><div><b>{student.name}</b><span>{student.reg} · {student.age} yrs</span></div></div></td><td>{student.slot}</td><td>{student.plan}</td><td><Status>{student.fee}</Status></td><td>{student.due}</td><td><Status>{student.status}</Status></td><td><div className="row-actions">{student.status === 'Pending' ? <button onClick={() => setModal({ type: 'admission-review', student })}>Review</button> : <button onClick={() => setModal({ type: 'student', student })}>View</button>}{student.status === 'Active' && <button onClick={() => updateStudent(student.id, { status: 'Paused' }, 'paused')}>Pause</button>}{student.status === 'Paused' && <button onClick={() => updateStudent(student.id, { status: 'Active' }, 'resumed')}>Resume</button>}{student.status === 'Discontinued' && <button onClick={() => updateStudent(student.id, { status: 'Archived' }, 'archived')}>Archive</button>}</div></td></tr>)}</tbody></table></div></section></> }
function Fees({ students, updateStudent }) { const dueStudents = students.filter((student) => student.fee === 'Due'); return <><PageTitle eyebrow="Financials" title="Fees & ledger"><button className="primary"><ArrowDownToLine size={16} /> Export ledger</button></PageTitle><div className="kpis compact"><Kpi label="Collected this month" value="₹86,400" trend="81% collection rate" Icon={CircleDollarSign} color="green" /><Kpi label="Outstanding" value={`₹${dueStudents.length * 1800},400`} trend={`${dueStudents.length} student accounts`} Icon={Bell} color="orange" /><Kpi label="Joining fees" value="₹7,500" trend="3 received this month" Icon={Check} color="blue" /></div><section className="panel"><div className="panel-head"><div><h2>Collections due</h2><span>Payment reminders are tracked in the student timeline</span></div><button className="outline">Send reminders</button></div><div className="table-wrap"><table><thead><tr><th>Student</th><th>Fee period</th><th>Amount</th><th>Due date</th><th>Status</th><th></th></tr></thead><tbody>{dueStudents.map((student) => <tr key={student.id}><td><div className="person"><Avatar student={student} /><b>{student.name}</b></div></td><td>July 2026</td><td>₹1,800</td><td>{student.due}</td><td><Status>Due</Status></td><td><button className="primary small" onClick={() => updateStudent(student.id, { fee: 'Paid' }, 'fee collected')}>Collect fee</button></td></tr>)}</tbody></table></div></section></> }
function Renewals({ students, updateStudent }) { return <><PageTitle eyebrow="Plan renewal" title="Renewal queue"><button className="outline">Reminder settings</button></PageTitle><section className="panel"><div className="panel-head"><div><h2>Upcoming renewals</h2><span>Sorted by plan expiry and reminder stage</span></div><Status>4 due</Status></div>{students.slice(0, 4).map((student, index) => <div className="renewal-row" key={student.id}><Avatar student={student} /><div className="grow"><b>{student.name} <small>{student.reg}</small></b><span>{student.plan} plan · Due {student.due}</span></div><Status>{index < 2 ? 'Due soon' : 'Reminder sent'}</Status><button className="outline" onClick={() => updateStudent(student.id, { fee: 'Paid' }, 'renewal collected')}>Renew plan</button></div>)}</section></> }
function Timeline({ events }) { return <><PageTitle eyebrow="Audit trail" title="Academy timeline"><button className="outline">Filter activity <ChevronDown size={15} /></button></PageTitle><section className="panel timeline"><TimelineItems events={events.concat([{ label: 'System backup completed', time: 'Yesterday, 10:00 PM', icon: Database }, { label: 'Arjun Nair paused membership', time: 'Jul 18, 4:40 PM', icon: Activity }])} /></section></> }
function TimelineItems({ events }) { return <div className="timeline-items">{events.map((event, index) => { const Icon = event.icon; return <div className="event" key={`${event.label}-${index}`}><div className="event-icon"><Icon size={15} /></div><div><b>{event.label}</b><span>{event.time}</span></div></div> })}</div> }
function Nets({ guarded, audit }) { return <><PageTitle eyebrow="Facility" title="Cricket net rentals"><button className="primary" onClick={() => guarded(() => audit('New net rental booking created', Activity))}><Plus size={17} /> New booking</button></PageTitle><div className="kpis compact"><Kpi label="Today’s bookings" value="7" trend="2 nets occupied now" Icon={Activity} color="blue" /><Kpi label="Rental revenue" value="₹4,200" trend="Today" Icon={CircleDollarSign} color="green" /></div><section className="panel"><div className="panel-head"><div><h2>Today’s net schedule</h2><span>Wednesday, July 23</span></div><button className="outline">Calendar view</button></div>{['Net 1 · 4:00 PM - 5:00 PM', 'Net 2 · 5:00 PM - 6:30 PM', 'Net 3 · 6:30 PM - 7:30 PM'].map((booking, index) => <div className="booking-row" key={booking}><div className="net-number">0{index + 1}</div><div className="grow"><b>{booking}</b><span>{index === 1 ? 'Academy batch' : 'Private practice · Paid'}</span></div><Status>{index === 1 ? 'In use' : 'Confirmed'}</Status><button className="outline">Details</button></div>)}</section></> }
function Jerseys({ guarded, audit }) { return <><PageTitle eyebrow="Merchandise" title="Jersey orders"><button className="primary" onClick={() => guarded(() => audit('New jersey order started', Crown))}><Plus size={17} /> Create order</button></PageTitle><section className="panel"><div className="panel-head"><div><h2>Order tracker</h2><span>Requests created at admission are tracked here</span></div></div>{['Riya Malhotra', 'Kabir Kapoor', 'Aarav Mehta'].map((name, index) => <div className="booking-row" key={name}><div className="jersey-icon"><Crown size={17} /></div><div className="grow"><b>{name}</b><span>Academy jersey · Size {index === 0 ? '34' : '36'} · Name print</span></div><Status>{['New', 'Printing', 'Ready'][index]}</Status><button className="outline">Update</button></div>)}</section></> }
function WhatsApp() { return <><PageTitle eyebrow="Communication" title="WhatsApp center"><button className="primary"><MessageCircle size={17} /> New message</button></PageTitle><div className="communication-grid"><section className="panel"><div className="panel-head"><div><h2>Quick campaigns</h2><span>Use roster filters to target families</span></div></div>{['Fee reminders', 'Attendance follow-up', 'Renewal notice', 'Batch announcement'].map((campaign) => <button className="campaign" key={campaign}><MessageCircle size={17} /><span>{campaign}</span><ChevronDown size={15} /></button>)}</section><section className="panel message-preview"><span className="eyebrow">Template preview</span><h2>Monthly fee reminder</h2><div className="chat-bubble">Hello {'{{parent_name}}'}, a reminder that {'{{student_name}}'}’s academy fee of ₹{'{{amount}}'} is due on {'{{due_date}}'}.</div><button className="primary">Send to 2 families</button></section></div></> }
function Reports({ students }) { return <><PageTitle eyebrow="Academy intelligence" title="Reports"><button className="primary"><ArrowDownToLine size={16} /> Export report</button></PageTitle><div className="report-grid"><section className="panel"><h2>Attendance leaderboard</h2>{[...students].sort((a, b) => b.attendance - a.attendance).slice(0, 3).map((student, index) => <div className="leader" key={student.id}><b>0{index + 1}</b><Avatar student={student} /><span className="grow">{student.name}</span><strong>{student.attendance}%</strong></div>)}</section><section className="panel"><h2>Plan distribution</h2><div className="donut"><strong>53<br /><small>students</small></strong></div><div className="legend"><span><i className="l1"></i> Monthly <b>18</b></span><span><i className="l2"></i> 3/6 Months <b>24</b></span><span><i className="l3"></i> Annual <b>11</b></span></div></section></div></> }
function UserManagement({ guarded, audit }) { return <><PageTitle eyebrow="Administration" title="User management"><button className="primary" onClick={() => guarded(() => audit('New staff user invited', ShieldCheck))}><Plus size={17} /> Invite user</button></PageTitle><section className="panel"><div className="panel-head"><div><h2>Team access</h2><span>Permissions enforce action-level security</span></div></div>{[['Priya Sharma', 'MANAGEMENT', 'Full operations'], ['Rahul Verma', 'COACH', 'Admissions, Attendance'], ['Neha Singh', 'STAFF', 'Admissions, Attendance, Jersey, Communication']].map(([name, role, permissions]) => <div className="booking-row" key={name}><div className="avatar teal">{name.split(' ').map((word) => word[0]).join('')}</div><div className="grow"><b>{name}</b><span>{permissions}</span></div><div className="role-badge">{role}</div><button className="outline">Manage</button></div>)}</section></> }
function Backup({ guarded, audit }) { return <><PageTitle eyebrow="Administration" title="Backup & restore"><button className="primary" onClick={() => guarded(() => audit('Manual encrypted backup created', Database))}><Database size={16} /> Create backup</button></PageTitle><div className="backup-grid"><section className="panel"><Database size={28} /><h2>Local backup ready</h2><span>Last successful backup: Today, 6:00 AM</span><button className="outline">Download archive</button></section><section className="panel"><Archive size={28} /><h2>Restore data</h2><span>Restoring replaces local data after confirmation.</span><button className="danger">Choose backup file</button></section></div></> }
function Modal({ modal, close, reviewStudent }) {
  const student = modal.student
  const [mode, setMode] = useState('summary')
  const admissionDefaults = { name: '', dob: '', gender: 'Select', school: '', grade: '', guardianName: '', parentMobile: '', altMobile: '', address: '', slot: 'Select Slot', joiningDate: '', plan: 'Select', fee: 0, admissionFee: 0, feePaid: 'Select', jerseyEnabled: false, jerseyName: '', jerseySize: 'Select Size', jerseyPairs: 1, kitType: kitTypeOptions[0], jerseyAmount: 0, comments: '', photo: null }
  const admission = { ...admissionDefaults, ...(student?.admission || {}) }
  const [draft, setDraft] = useState(() => ({ ...admission }))
  const set = (key) => (event) => setDraft((current) => ({ ...current, [key]: event.target.value }))
  const handleDraftPhoto = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setDraft((current) => ({ ...current, photo: reader.result }))
    reader.readAsDataURL(file)
  }
  if (modal.type === 'admission-review') {
    const handleAccept = () => { reviewStudent(student.id, { status: 'Active' }, 'admission accepted'); close() }
    const handleDecline = () => { reviewStudent(student.id, { status: 'Declined' }, 'admission declined'); close() }
    const handleSave = () => {
      reviewStudent(student.id, { name: draft.name, school: draft.school, slot: draft.slot, plan: draft.plan, parent: draft.parentMobile, mobile: draft.parentMobile, age: calculateAge(draft.dob) || student.age, admission: { ...draft } }, 'admission details updated')
      setMode('summary')
    }
    return <div className="modal-backdrop" onClick={close}><div className={`modal admission-review-modal${mode !== 'summary' ? ' detailed' : ''}`} onClick={(event) => event.stopPropagation()}>
      <button className="icon-button modal-close" onClick={close}><X size={18} /></button>
      <div className="modal-icon"><ClipboardCheck size={23} /></div>
      <h2>{mode === 'edit' ? 'Edit admission details' : mode === 'view' ? 'Admission details' : 'New admission for approval'}</h2>
      <p>{student?.reg} · {mode === 'summary' ? 'Awaiting management review' : student?.name}</p>
      {mode === 'summary' && <div className="review-summary">
        <div><span>Student</span><b>{student?.name || '-'}</b></div>
        <div><span>School</span><b>{student?.school || '-'}</b></div>
        <div><span>Batch Timing</span><b>{student?.slot || '-'}</b></div>
        <div><span>Plan</span><b>{student?.plan || '-'}</b></div>
        <div><span>Joining date</span><b>{student?.due || '-'}</b></div>
        <div><span>Status</span><b>{student?.status || '-'}</b></div>
      </div>}
      {mode === 'view' && <div className="review-summary detailed">
        {admission.photo && <img className="review-photo span-2" src={admission.photo} alt={admission.name} />}
        <div><span>Student Name</span><b>{admission.name || '-'}</b></div>
        <div><span>Date of Birth</span><b>{admission.dob || '-'}</b></div>
        <div><span>Age</span><b>{calculateAge(admission.dob) || '-'}</b></div>
        <div><span>Gender</span><b>{admission.gender || '-'}</b></div>
        <div><span>School Name</span><b>{admission.school || '-'}</b></div>
        <div><span>Grade</span><b>{admission.grade || '-'}</b></div>
        <div><span>Parent/Guardian Name</span><b>{admission.guardianName || '-'}</b></div>
        <div><span>Parent Mobile</span><b>{admission.parentMobile || '-'}</b></div>
        <div><span>Alternate Mobile</span><b>{admission.altMobile || '-'}</b></div>
        <div className="span-2"><span>Address</span><b>{admission.address || '-'}</b></div>
        <div><span>Batch Timing</span><b>{admission.slot || '-'}</b></div>
        <div><span>Joining Date</span><b>{admission.joiningDate || '-'}</b></div>
        <div><span>Plan</span><b>{admission.plan || '-'}</b></div>
        <div><span>Fee (₹)</span><b>{Number(admission.fee) || 0}</b></div>
        <div><span>Admission Fee (₹)</span><b>{Number(admission.admissionFee) || 0}</b></div>
        <div><span>Fee Paid</span><b>{admission.feePaid || '-'}</b></div>
        <div><span>Jersey Required</span><b>{admission.jerseyEnabled ? 'Yes' : 'No'}</b></div>
        {admission.jerseyEnabled && <>
          <div><span>Name on Jersey</span><b>{admission.jerseyName || '-'}</b></div>
          <div><span>Jersey Size</span><b>{admission.jerseySize || '-'}</b></div>
          <div><span>No. of Pairs</span><b>{admission.jerseyPairs || '-'}</b></div>
          <div><span>Kit Type</span><b>{admission.kitType || '-'}</b></div>
          <div><span>Jersey Amount (₹)</span><b>{Number(admission.jerseyAmount) || 0}</b></div>
        </>}
        <div className="span-2"><span>Comments / Special Request</span><b>{admission.comments || '-'}</b></div>
      </div>}
      {mode === 'edit' && <div className="modal-detail-grid">
        <div className="field photo-field"><label>Photo</label><div className="photo-upload">{draft.photo ? <img src={draft.photo} alt="Student" /> : <div className="photo-placeholder"><Camera size={20} /></div>}<label className="outline photo-button">Upload<input type="file" accept="image/*" onChange={handleDraftPhoto} hidden /></label></div></div>
        <div className="field"><label>Student Name</label><input value={draft.name} onChange={set('name')} /></div>
        <div className="field"><label>Date of Birth</label><input type="date" value={draft.dob} onChange={set('dob')} /></div>
        <div className="field"><label>Gender</label><select value={draft.gender} onChange={set('gender')}>{genderOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
        <div className="field"><label>School Name</label><input value={draft.school} onChange={set('school')} /></div>
        <div className="field"><label>Grade</label><input value={draft.grade} onChange={set('grade')} /></div>
        <div className="field"><label>Parent/Guardian Name</label><input value={draft.guardianName} onChange={set('guardianName')} /></div>
        <div className="field"><label>Parent Mobile</label><input value={draft.parentMobile} onChange={set('parentMobile')} /></div>
        <div className="field"><label>Alternate Mobile</label><input value={draft.altMobile} onChange={set('altMobile')} /></div>
        <div className="field full"><label>Address</label><textarea rows={2} value={draft.address} onChange={set('address')} /></div>
        <div className="field"><label>Batch Timing</label><select value={draft.slot} onChange={set('slot')}>{slotOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
        <div className="field"><label>Joining Date</label><input type="date" value={draft.joiningDate} onChange={set('joiningDate')} /></div>
        <div className="field"><label>Plan</label><select value={draft.plan} onChange={set('plan')}>{planOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
        <div className="field"><label>Fee (₹)</label><input type="number" min="0" value={draft.fee} onChange={set('fee')} /></div>
        <div className="field"><label>Admission Fee (₹)</label><input type="number" min="0" value={draft.admissionFee} onChange={set('admissionFee')} /></div>
        <div className="field"><label>Fee Paid</label><select value={draft.feePaid} onChange={set('feePaid')}>{feePaidOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
        <div className="field full"><label>Jersey Required</label><div className="segmented">{['No', 'Yes'].map((option) => <button type="button" key={option} className={(option === 'Yes') === draft.jerseyEnabled ? 'active' : ''} onClick={() => setDraft((current) => ({ ...current, jerseyEnabled: option === 'Yes' }))}>{option}</button>)}</div></div>
        {draft.jerseyEnabled && <>
          <div className="field"><label>Name on Jersey</label><input value={draft.jerseyName} onChange={set('jerseyName')} /></div>
          <div className="field"><label>Jersey Size</label><select value={draft.jerseySize} onChange={set('jerseySize')}>{jerseySizeOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
          <div className="field"><label>No. of Pairs</label><input type="number" min="1" value={draft.jerseyPairs} onChange={set('jerseyPairs')} /></div>
          <div className="field"><label>Kit Type</label><select value={draft.kitType} onChange={set('kitType')}>{kitTypeOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
          <div className="field"><label>Jersey Amount (₹)</label><input type="number" min="0" value={draft.jerseyAmount} onChange={set('jerseyAmount')} /></div>
        </>}
        <div className="field full"><label>Comments / Special Request</label><textarea rows={2} value={draft.comments} onChange={set('comments')} /></div>
      </div>}
      <div className="modal-actions">
        {mode === 'summary' && <><button className="outline" onClick={() => setMode('view')}><Eye size={15} /> View details</button><button className="outline" onClick={() => setMode('edit')}>Edit details</button><button className="danger" onClick={handleDecline}>Decline</button><button className="primary" onClick={handleAccept}><Check size={16} /> Accept</button></>}
        {mode === 'view' && <><button className="outline" onClick={() => setMode('summary')}>Back</button><button className="outline" onClick={() => setMode('edit')}>Edit details</button><button className="danger" onClick={handleDecline}>Decline</button><button className="primary" onClick={handleAccept}><Check size={16} /> Accept</button></>}
        {mode === 'edit' && <><button className="outline" onClick={() => setMode('summary')}>Cancel</button><button className="primary" onClick={handleSave}>Save changes</button></>}
      </div>
    </div></div>
  }
  return <div className="modal-backdrop" onClick={close}><div className="modal" onClick={(event) => event.stopPropagation()}><button className="icon-button modal-close" onClick={close}><X size={18} /></button><div className="modal-icon">{modal.type === 'guard' ? <ShieldCheck size={23} /> : <Users size={23} />}</div><h2>{modal.type === 'guard' ? 'Edit Mode required' : student?.name || 'Student profile'}</h2><p>{modal.type === 'guard' ? 'Management accounts are view-only by default. Turn on Edit Mode in the top bar to change academy records.' : student ? `${student.reg} · ${student.parent} · ${student.mobile}` : 'Use New admission to add a student through the approval flow.'}</p><button className="primary" onClick={close}>{modal.type === 'guard' ? 'Understood' : 'Close profile'}</button></div></div>
}

export default App