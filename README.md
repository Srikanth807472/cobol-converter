# Interactive Resume Editor

A modern, responsive web application that allows you to create, edit, and manage your professional resume with real-time editing capabilities and local storage persistence.

## 🌟 Features

### ✏️ **Live Editing**
- Click any text element to edit in place
- Real-time preview as you type
- Auto-save functionality
- Keyboard shortcuts for common actions

### 💾 **Data Persistence** 
- Automatic saving to browser's local storage
- Export resume data as JSON file
- Import previously saved resume data
- No server required - everything runs locally

### 🎨 **Professional Design**
- Modern, clean interface with gradient backgrounds
- Responsive design that works on all devices
- Print-friendly styling for physical copies
- Professional typography and spacing

### 📝 **Resume Sections**
- **Personal Information** - Name, contact details, photo
- **Professional Summary** - Elevator pitch and overview
- **Work Experience** - Job history with achievements
- **Education** - Academic background and certifications
- **Skills** - Technical and soft skills organized by category
- **Projects** - Portfolio items with technology tags

### 🔧 **Advanced Features**
- **Photo Upload** - Add your professional headshot
- **Section Management** - Add/remove experience, education, projects
- **Modal Editing** - Dedicated forms for complex edits
- **Print Support** - Clean, professional print layout
- **Keyboard Shortcuts** - Efficient navigation and editing
- **Notifications** - User feedback for all actions

## 🚀 Quick Start

### Installation
1. **Download the files** to your computer
2. **Open `index.html`** in any modern web browser
3. **Start editing** your resume immediately!

### No Dependencies Required
- Pure HTML, CSS, and JavaScript
- Works offline after initial load
- No installation or setup needed
- Compatible with all modern browsers

## 📖 How to Use

### Getting Started
1. **Open the application** in your web browser
2. **Click "Edit Mode"** to start making changes
3. **Click on any text** to edit it directly
4. **Use the section controls** to add/remove items
5. **Click "Save"** to persist your changes

### Edit Modes

#### 📝 **Edit Mode**
- Green dashed borders around editable content
- Click any text to start editing
- Press Enter or click outside to save changes
- Use section buttons to add/remove items

#### 👁️ **Preview Mode**
- Clean view without editing indicators
- Perfect for reviewing your resume
- Automatic when printing
- Professional presentation

### Adding Content

#### ➕ **Add New Items**
- **Experience**: Click "Add Experience" button
- **Education**: Click "Add Education" button  
- **Projects**: Click "Add Project" button
- **Skills**: Click "Add Skill" button

#### 🗑️ **Remove Items**
- Hover over any experience/education/project item
- Click the red trash icon that appears
- Confirm deletion in the popup

### Photo Management
- **Upload**: Click on the placeholder photo
- **Replace**: Click on existing photo to change
- **Formats**: Supports JPG, PNG, GIF, WebP
- **Storage**: Saved automatically with your resume

### Data Management

#### 💾 **Saving**
- **Manual Save**: Click "Save" button or press Ctrl+S
- **Auto Save**: Automatic saves every 2 seconds while editing
- **Storage**: Data saved to browser's local storage

#### 📤 **Export/Import**
- **Export**: Click "Export" to download JSON file
- **Import**: Click "Load" to upload JSON file
- **Backup**: Regular exports recommended

#### 🖨️ **Printing**
- **Print**: Click "Print" button or press Ctrl+P
- **Layout**: Optimized for standard paper sizes
- **Clean**: Edit controls hidden automatically

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` / `Cmd+S` | Save resume |
| `Ctrl+E` / `Cmd+E` | Toggle edit mode |
| `Ctrl+P` / `Cmd+P` | Print resume |
| `Enter` | Save current edit |
| `Escape` | Cancel current edit |

## 🎨 Customization

### Styling
- **Colors**: Edit CSS variables in `styles.css`
- **Fonts**: Change font imports in `index.html`
- **Layout**: Modify grid systems in CSS
- **Animations**: Adjust transition timing

### Content Structure
- **Sections**: Add new sections in HTML
- **Fields**: Define data fields with `data-field` attributes
- **Validation**: Extend JavaScript validation rules

### Responsive Breakpoints
- **Desktop**: 1200px+ (Full layout)
- **Tablet**: 768px-1199px (Adapted layout)  
- **Mobile**: <768px (Stacked layout)
- **Print**: Optimized for A4/Letter paper

## 🛠️ Technical Details

### Architecture
- **Frontend Only**: No backend or server required
- **Vanilla JavaScript**: No frameworks or dependencies
- **CSS Grid/Flexbox**: Modern layout techniques
- **LocalStorage API**: Client-side data persistence

### Browser Support
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### File Structure
```
resume-editor/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling and responsive design
├── script.js           # Interactive functionality and data management
└── README.md           # This documentation file
```

### Data Format
```json
{
  "fullName": "John Doe",
  "jobTitle": "Software Developer", 
  "email": "john.doe@email.com",
  "phone": "+1 (555) 123-4567",
  "location": "San Francisco, CA",
  "linkedin": "linkedin.com/in/johndoe",
  "summary": "Professional summary text...",
  "profilePhoto": "data:image/jpeg;base64,..."
}
```

## 🎯 Use Cases

### 🔍 **Job Seekers**
- Create professional resumes quickly
- Customize for different positions
- Always have an up-to-date version
- Print when needed for interviews

### 💼 **Professionals**
- Maintain current resume easily
- Update with new achievements
- Share digital or printed copies
- Multiple format exports

### 🎓 **Students**
- Build first professional resume
- Learn resume best practices
- Easy to update as skills grow
- Professional templates included

### 🏢 **Recruiters/HR**
- Standardized resume format
- Easy to read and evaluate
- Print-friendly for interviews
- Consistent professional appearance

## 🔧 Troubleshooting

### Common Issues

#### Data Not Saving
- **Check**: Browser localStorage enabled
- **Solution**: Enable localStorage in browser settings
- **Alternative**: Use export/import for backup

#### Photo Not Uploading
- **Check**: File size under 5MB
- **Check**: File format (JPG, PNG, GIF, WebP)
- **Solution**: Resize or convert image format

#### Print Layout Issues
- **Check**: Browser print preview
- **Solution**: Use "Print" button instead of browser print
- **Settings**: Select "More settings" > "Backgrounds"

#### Mobile Display Problems
- **Check**: Viewport meta tag present
- **Solution**: Refresh page or try different mobile browser
- **Zoom**: Adjust browser zoom to 100%

### Browser-Specific Notes

#### Safari
- May require user gesture for localStorage
- Print backgrounds need to be enabled manually

#### Firefox
- localStorage quota warnings in developer console (normal)
- Print margins may need adjustment

#### Edge/Chrome
- Full feature support
- Recommended browsers for best experience

## 🚀 Future Enhancements

### Planned Features
- [ ] **Multiple Themes** - Light/dark mode toggle
- [ ] **PDF Export** - Direct PDF generation
- [ ] **Cloud Sync** - Google Drive/Dropbox integration  
- [ ] **Templates** - Multiple resume layouts
- [ ] **Collaboration** - Share for feedback
- [ ] **Analytics** - View tracking for online resumes

### Technical Improvements
- [ ] **PWA Support** - Offline functionality
- [ ] **Performance** - Lazy loading optimizations
- [ ] **Accessibility** - WCAG 2.1 AA compliance
- [ ] **Internationalization** - Multi-language support

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Make your changes
3. Test in multiple browsers
4. Submit a pull request

### Reporting Issues
- Use GitHub Issues for bug reports
- Include browser and version information
- Provide steps to reproduce the issue
- Screenshots are helpful

## 📞 Support

For questions, issues, or suggestions:
- **GitHub Issues**: [Create an issue](../../issues)
- **Email**: [your-email@example.com](mailto:your-email@example.com)
- **Documentation**: This README file

---

**Built with ❤️ for job seekers and professionals worldwide.**

*Make your resume stand out with professional design and modern technology!*