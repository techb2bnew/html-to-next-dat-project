'use client'
import Script from 'next/script'
import { Home } from 'lucide-react'

const inlineCSS = `

      body {
        margin: 0;
        padding: 0;
        font-family: "Inter", sans-serif;
        background: #ffffff;
        display: flex;
        height: 100vh;
        overflow: hidden;
        color: #333;
      }

      /* View Management */
      .dat-view {
        display: none;
        height: 100vh;
        width: 100vw;
      }
      .dat-view.active {
        display: flex;
      }
      .sub-view {
        display: none;
        height: 100%;
        flex-direction: column;
        overflow-y: auto;
        background: #f1f3f8;
      }
      .sub-view.active {
        display: flex;
      }

      /* Login Screen */
      #dat-view-login {
        background-color: #1e293b;
        background-image:
          linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)),
          url('data:image/svg+xml;utf8,<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h400v400H0z" fill="none"/><path d="M10 10l50 50m0-50l-50 50" stroke="%23334155" stroke-width="1"/></svg>');
        background-size: cover;
        justify-content: center;
        align-items: center;
      }

      .login-card {
        background: white;
        padding: 40px;
        border-radius: 8px;
        width: 360px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        text-align: center;
      }

      .login-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-bottom: 25px;
      }
      .login-logo-box {
        background: #0044cc;
        color: white;
        font-weight: 900;
        font-size: 2rem;
        padding: 4px 8px;
        line-height: 1;
        letter-spacing: -2px;
        border-radius: 2px;
      }

      .login-input {
        width: 100%;
        padding: 12px;
        border: 1px solid #0044cc;
        border-radius: 4px;
        margin-bottom: 20px;
        font-size: 0.9rem;
        box-sizing: border-box;
        outline: none;
      }

      .login-btn {
        width: 100%;
        background: #0044cc;
        color: white;
        border: none;
        padding: 14px;
        border-radius: 24px;
        font-weight: 700;
        cursor: pointer;
        margin-bottom: 20px;
      }

      /* DAT Sidebar */
      .dat-sidebar {
        width: 250px;
        min-width: 250px;
        background: #111827;
        color: #94a3b8;
        display: flex;
        flex-direction: column;
        border-right: 1px solid #1e293b;
        z-index: 50;
      }

      .dat-sidebar-logo {
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        border-bottom: 1px solid #1e293b;
      }

      .dat-nav {
        flex: 1;
        padding-top: 15px;
      }

      .dat-nav-item {
        padding: 15px 20px;
        display: flex;
        align-items: center;
        gap: 15px;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .dat-nav-item:hover {
        color: white;
        background: rgba(255, 255, 255, 0.05);
      }

      .dat-nav-item.active {
        color: white;
        background: #1e293b;
        border-left: 4px solid #3b82f6;
      }

      .dat-bottom-nav {
        border-top: 1px solid #1e293b;
        padding: 10px 0;
      }

      /* Main Content */
      .dat-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: #f8fafc;
      }

      /* Dashboard Styles */
      .dashboard-header {
        background: white;
        padding: 15px 30px;
        font-size: 1.5rem;
        font-weight: 800;
        border-bottom: 1px solid #e2e8f0;
      }

      .dashboard-content {
        padding: 30px;
        display: flex;
        gap: 30px;
      }

      .dashboard-main-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .dashboard-action-btns {
        display: flex;
        gap: 15px;
      }
      .dash-action-btn {
        background: white;
        border: 1px solid #cbd5e1;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .dash-cards-row {
        display: flex;
        gap: 20px;
      }
      .dash-card {
        flex: 1;
        background: white;
        padding: 20px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
      }
      .dash-whats-new {
        background: white;
        padding: 30px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        min-height: 300px;
      }

      .dashboard-side-col {
        width: 340px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        padding: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        max-height: 600px;
      }

      .nat-load-header {
        text-align: center;
        padding: 30px 20px 10px;
        background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg"><path fill="%23f1f5f9" d="M120,200 Q150,180 200,200 T300,150 T450,180 T600,150 T750,220 T850,200 T900,300 T850,450 T700,500 T600,550 T450,500 T250,550 T150,400 T120,300 Z"/></svg>');
        background-size: contain;
        background-position: center top;
        background-repeat: no-repeat;
      }

      .nat-load-list {
        flex: 1;
        overflow-y: auto;
        padding: 0 20px 20px;
      }

      /* Custom Scrollbar for widget */
      .nat-load-list::-webkit-scrollbar {
        width: 6px;
      }
      .nat-load-list::-webkit-scrollbar-track {
        background: transparent;
      }
      .nat-load-list::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }

      /* Multi-Tab Bar */
      .search-tabs-bar {
        display: flex;
        align-items: flex-end;
        background: #e2e8f0;
        border-bottom: 1px solid #cbd5e1;
        padding-top: 8px;
        padding-left: 8px;
        height: 42px;
      }
      .search-tab {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 15px;
        height: 34px;
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-bottom: none;
        border-top-left-radius: 2px;
        border-top-right-radius: 2px;
        margin-right: 4px;
        cursor: pointer;
        color: #475569;
        font-size: 0.85rem;
        font-weight: 600;
        min-width: 160px;
      }
      .search-tab.active {
        background: #ffffff;
        border-top: 3px solid #0044cc;
        border-right: 1px solid #cbd5e1;
        border-left: 1px solid #cbd5e1;
        border-bottom: 1px solid #ffffff;
        margin-bottom: -1px;
      }
      .search-tab-content {
        display: flex;
        flex-direction: column;
        line-height: 1.2;
      }
      .search-tab-origin {
        font-weight: 700;
        font-size: 0.8rem;
        color: #1e293b;
      }
      .search-tab-dest {
        font-weight: 600;
        font-size: 0.75rem;
        color: #475569;
      }
      .tab-icons {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #64748b;
      }
      .tab-icons span {
        cursor: pointer;
      }
      .add-tab-btn {
        background: #0044cc;
        color: white;
        border: none;
        width: 30px;
        height: 30px;
        border-radius: 4px;
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        margin-left: 10px;
        margin-bottom: 5px;
      }
      .top-tabs {
        background: #f1f3f8;
        padding: 0;
        display: flex;
        border-bottom: 1px solid #d1d5db;
        height: 48px;
        flex-shrink: 0;
      }
      .active-tab {
        background: #ffffff;
        border: 1px solid #d1d5db;
        border-bottom: none;
        padding: 8px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 250px;
        font-size: 0.8rem;
        font-weight: 600;
        color: #1e293b;
        border-top: 3px solid #3b82f6;
        margin-top: 4px;
        margin-left: 10px;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
      }

      /* Search Section */
      .search-section {
        background: #ffffff;
        padding: 20px 20px;
        border-bottom: 1px solid #e2e8f0;
        flex-shrink: 0;
      }

      .search-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }

      .input-box {
        position: relative;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        background: #ffffff;
        display: flex;
        align-items: center;
        height: 40px;
        padding: 0 12px;
        transition: border-color 0.2s;
      }
      .input-box:focus-within {
        border-color: #2563eb;
        box-shadow: 0 0 0 1px #2563eb;
      }

      .input-box.origin-dest {
        flex: 1;
        min-width: 250px;
        position: relative;
      }
      .input-box.dh {
        width: 50px;
        text-align: center;
      }
      .input-box.dropdown {
        width: 180px;
      }

      .input-label {
        position: absolute;
        top: -7px;
        left: 8px;
        background: #ffffff;
        padding: 0 4px;
        font-size: 0.65rem;
        font-weight: 600;
        color: #94a3b8;
        z-index: 2;
      }

      .input-box input,
      .input-box select {
        border: none;
        outline: none;
        width: 100%;
        font-size: 0.85rem;
        font-family: inherit;
        color: #1e293b;
        background: transparent;
      }

      /* Remove arrows from number inputs */
      .input-box input[type="number"]::-webkit-inner-spin-button,
      .input-box input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .input-box input[type="number"] {
        -moz-appearance: textfield;
        appearance: textfield;
      }

      /* Autocomplete Dropdown */
      .autocomplete-list {
        position: absolute;
        top: 45px;
        left: 0;
        width: 100%;
        background: white;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 100;
        display: none;
        max-height: 200px;
        overflow-y: auto;
      }
      .autocomplete-item {
        padding: 10px 12px;
        font-size: 0.85rem;
        cursor: pointer;
        border-bottom: 1px solid #f1f5f9;
      }
      .autocomplete-item:hover {
        background: #eff6ff;
      }

      /* AI Simulator Modals */
      .ai-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.7);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .ai-modal {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }
      .ai-modal-header {
        background: #0f172a;
        color: white;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .ai-modal-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
      }
      .ai-btn {
        background: #2563eb;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
      }
      .ai-btn:hover {
        background: #1d4ed8;
      }
      .ai-msg {
        margin-bottom: 15px;
        padding: 10px;
        border-radius: 8px;
        max-width: 85%;
      }
      .ai-msg.broker {
        background: #f1f5f9;
        align-self: flex-start;
      }
      .ai-msg.user {
        background: #eff6ff;
        align-self: flex-end;
        margin-left: auto;
        color: #1e3a8a;
      }

      /* Custom Dropdown */
      .custom-dropdown {
        cursor: pointer;
        outline: none;
        position: relative;
      }
      .dropdown-selected {
        width: 100%;
        font-size: 0.85rem;
        color: #1e293b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .custom-dropdown-list {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        min-width: 100%;
        background: white;
        border-radius: 4px;
        box-shadow:
          0 4px 20px rgba(0, 0, 0, 0.15),
          0 0 0 1px rgba(0, 0, 0, 0.05);
        z-index: 200;
        display: none;
        flex-direction: column;
        padding: 8px 0;
      }
      .custom-dropdown.open .custom-dropdown-list,
      .custom-dropdown:focus-within .custom-dropdown-list {
        display: flex;
      }
      .cd-item {
        padding: 10px 16px;
        font-size: 0.85rem;
        color: #1e293b;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .cd-item:hover {
        background: #eef2ff;
      }
      .cd-item.active {
        background: #e0e7ff;
      }
      .cd-all {
        color: #1d4ed8;
        font-weight: 700;
        font-size: 0.8rem;
      }
      .cd-shortcut {
        color: #94a3b8;
        font-size: 0.75rem;
      }

      @keyframes flashGreen {
        0% { background-color: #ecfdf5; }
        30% { background-color: #10b981; }
        100% { background-color: transparent; }
      }
      .new-load-flash {
        animation: flashGreen 3s ease-out;
      }

      .search-btn {
        background: #0044cc;
        color: white;
        border: none;
        border-radius: 20px;
        padding: 0 24px;
        height: 40px;
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: 10px;
      }

      .filters-row {
        display: flex;
        gap: 16px;
        margin-top: 4px;
      }
      .filter-tag {
        font-size: 0.7rem;
        font-weight: 700;
        color: #475569;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        text-transform: uppercase;
      }

      /* Empty State Tabs */
      .empty-state-tabs {
        display: flex;
        justify-content: center;
        border-bottom: 1px solid #e2e8f0;
        margin-bottom: 50px;
        width: 100%;
      }
      .empty-tab {
        padding: 15px 40px;
        font-size: 0.85rem;
        font-weight: 700;
        color: #475569;
        cursor: pointer;
        position: relative;
      }
      .empty-tab.active {
        color: #1e293b;
      }
      .empty-tab.active::after {
        content: "";
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background: #2563eb;
      }

      /* Results Area */
      #dat-search-empty {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: white;
      }

      #dat-search-results {
        flex: 1;
        display: none;
        flex-direction: column;
        overflow: hidden;
      }

      .results-stats-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
        background: #ffffff;
        flex-shrink: 0;
      }

      .results-count .num {
        font-size: 1.3rem;
        font-weight: 800;
        color: #0f172a;
        margin-left: 10px;
      }
      .results-count .similar {
        font-size: 0.85rem;
        color: #64748b;
        font-weight: 500;
        margin-left: 10px;
      }

      /* Table */
      .table-container {
        flex: 1;
        overflow-y: auto;
        background: #ffffff;
        border-top: 1px solid #e2e8f0;
      }

      .dat-table {
        width: 100%;
        border-collapse: collapse;
      }
      .dat-table th {
        position: sticky;
        top: 0;
        background: #ffffff;
        color: #475569;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 12px 10px;
        text-align: left;
        border-bottom: 2px solid #e2e8f0;
        z-index: 10;
        white-space: nowrap;
      }
      .dat-table td {
        padding: 10px;
        font-size: 0.8rem;
        color: #1e293b;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }

      /* Fake data for demo until JS loads */
      .rate-badge {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .rate-icon {
        background: #1e293b;
        color: white;
        border-radius: 50%;
        width: 14px;
        height: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.55rem;
        font-weight: bold;
      }

      /* Column specific styling */
      .col-checkbox {
        width: 40px;
        text-align: center;
      }
      .col-age {
        font-weight: 600;
        width: 50px;
      }
      .col-rate {
        font-weight: 700;
        width: 90px;
      }
      .col-trip {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 180px;
      }
      .trip-dist {
        color: #0044cc;
        font-weight: 700;
        width: 35px;
        text-align: right;
      }
      .trip-dots {
        color: #0044cc;
        font-size: 0.5rem;
        line-height: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .trip-cities {
        display: flex;
        flex-direction: column;
        font-size: 0.75rem;
        font-weight: 600;
        line-height: 1.3;
      }

      .col-dho {
        text-align: center;
        width: 60px;
        font-size: 0.75rem;
        color: #475569;
        font-weight: 600;
      }
      .col-pickup {
        width: 70px;
        font-weight: 600;
      }
      .col-equip {
        width: 60px;
        font-weight: 700;
      }

      .col-company {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .company-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .company-name {
        color: #0044cc;
        font-weight: 600;
        font-size: 0.75rem;
      }
      .company-phone {
        color: #0044cc;
        font-weight: 500;
        font-size: 0.75rem;
      }

      .company-stats {
        display: flex;
        flex-direction: column;
        text-align: right;
        font-size: 0.7rem;
        color: #64748b;
        font-weight: 700;
        margin-right: 15px;
      }
      .company-stats .cs {
        color: #1e293b;
      }

      /* Expanded Row */
      .expanded-row-container {
        background: #ffffff;
        border-bottom: 2px solid #e2e8f0;
      }
      .expanded-content {
        padding: 20px 30px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        background: #ffffff;
        border-top: 1px solid #f1f5f9;
      }
      .expanded-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 1.2rem;
        font-weight: 800;
        color: #1e293b;
      }
      .expanded-grid {
        display: grid;
        grid-template-columns: 1.2fr 1fr 1fr;
        gap: 40px;
      }
      .expanded-col {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .expanded-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .expanded-section h4 {
        margin: 0;
        font-size: 0.75rem;
        color: #64748b;
        text-transform: uppercase;
        font-weight: 700;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 6px;
        display: flex;
        justify-content: space-between;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: #1e293b;
        margin-bottom: 4px;
      }
      .info-label {
        color: #64748b;
        width: 120px;
      }
      .info-val {
        font-weight: 600;
        flex: 1;
      }
      .route-visual {
        display: flex;
        gap: 12px;
      }
      .route-line {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #0044cc;
      }
      .route-line .dot {
        font-size: 0.7rem;
      }
      .route-line .line {
        flex: 1;
        width: 2px;
        border-left: 2px dotted #94a3b8;
        margin: 4px 0;
      }
      .route-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .route-point {
        display: flex;
        flex-direction: column;
        font-size: 0.85rem;
        font-weight: 700;
      }

      .dat-table tbody tr.main-row {
        cursor: pointer;
      }
      .dat-table tbody tr.main-row.active {
        background: #eff6ff !important;
        border-left: 3px solid #0044cc;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      .recommended-match-btn {
        background: #10b981;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 6px 12px;
        font-size: 0.75rem;
        font-weight: 800;
        cursor: pointer;
        transition:
          background-color 0.2s,
          transform 0.1s;
        box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
        outline: none;
      }
      .recommended-match-btn:hover {
        background: #059669;
        transform: translateY(-1px);
      }
      .recommended-match-btn:active {
        transform: translateY(0);
      }

      /* --- Mobile Responsive Improvements --- */
      .dat-mobile-hamburger {
        display: none;
        position: fixed;
        top: 12px;
        left: 12px;
        z-index: 1000;
        background: #1e293b;
        color: white;
        border: 1px solid rgba(255,255,255,0.15);
        padding: 8px 14px;
        border-radius: 6px;
        font-size: 1.2rem;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        align-items: center;
        justify-content: center;
      }

      .dat-sidebar-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(2px);
        z-index: 45;
      }
      .dat-sidebar-close-btn {
        display: none;
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 5px;
      }

      @media (max-width: 1024px) {
        .dat-sidebar-close-btn {
          display: block;
        }
        .dat-mobile-hamburger {
          display: flex;
        }

        .dat-sidebar-overlay.open {
          display: block;
        }

        .dat-sidebar {
          position: fixed;
          top: 0;
          left: -260px;
          height: 100vh;
          width: 250px;
          min-width: 250px;
          transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 50;
          box-shadow: 5px 0 25px rgba(0,0,0,0.3);
        }

        .dat-sidebar.open {
          left: 0;
        }

        /* Adjust main area to start from top left and not pad sidebar */
        .dat-main {
          width: 100%;
          min-width: 100%;
        }

        /* Shift header titles on mobile to avoid overlapping the hamburger button */
        .dashboard-header, 
        .sim-header,
        .search-tabs-bar {
          padding-left: 65px !important;
        }

        /* Dashboard View layout */
        .dashboard-content {
          flex-direction: column !important;
          padding: 15px !important;
          gap: 20px !important;
        }

        .dash-cards-row {
          flex-direction: column !important;
          gap: 15px !important;
        }

        .dashboard-side-col {
          width: 100% !important;
          min-width: 100% !important;
        }

        /* Search Section inputs stack */
        .search-section {
          padding: 15px !important;
        }

        .search-row {
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 15px !important;
        }

        .input-box {
          width: 100% !important;
          box-sizing: border-box !important;
        }

        .search-btn {
          width: 100% !important;
          margin-left: 0 !important;
          justify-content: center !important;
        }

        /* Expanded content grids in search results */
        .expanded-grid {
          grid-template-columns: 1fr !important;
          gap: 20px !important;
        }

        .expanded-content {
          padding: 15px !important;
        }

        /* Table container handles horizontal scroll */
        .table-container {
          overflow-x: auto !important;
        }
      }
    
`

const bodyHTML = `
<!-- 1. Login View -->
    <div id="dat-view-login" class="dat-view active">
      <div class="login-card">
        <div class="login-logo">
          <div class="login-logo-box">DAT</div>
          <div style="text-align: left; color: #1e293b">
            <div style="font-weight: 800; font-size: 1.1rem; line-height: 1">
              Freight
            </div>
            <div style="font-size: 0.8rem; font-weight: 600">& Analytics</div>
          </div>
        </div>
        <h2 style="margin-bottom: 25px; font-weight: 800">Log In</h2>
        <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 20px">
          To continue to your DAT account
        </p>

        <div style="position: relative; text-align: left">
          <span
            style="
              position: absolute;
              top: -8px;
              left: 8px;
              background: white;
              padding: 0 4px;
              font-size: 0.7rem;
              color: #0044cc;
              font-weight: 600;
            "
            >Email address*</span
          >
          <input
            id="student-email"
            type="email"
            class="login-input"
            placeholder="Enter your email address"
            autocomplete="email"
          />
        </div>

        <div style="position: relative; text-align: left">
          <span
            style="
              position: absolute;
              top: -8px;
              left: 8px;
              background: white;
              padding: 0 4px;
              font-size: 0.7rem;
              color: #0044cc;
              font-weight: 600;
            "
            >Your Name*</span
          >
          <input
            id="student-name"
            type="text"
            class="login-input"
            placeholder="Enter your full name"
            autocomplete="name"
          />
        </div>

        <button class="login-btn" onclick="datLogin()">CONTINUE</button>
        <div style="font-size: 0.8rem; color: #64748b">
          Don't have an account?
          <span style="color: #0044cc; font-weight: 700; cursor: pointer"
            >Sign up</span
          >
        </div>
      </div>
    </div>

    <!-- 2. Application View (Sidebar + Main) -->
    <div id="dat-app" class="dat-view">
      <button class="dat-mobile-hamburger" onclick="toggleDatSidebar()">☰</button>
      <div id="dat-sidebar-overlay" class="dat-sidebar-overlay" onclick="toggleDatSidebar()"></div>
      <!-- DAT Sidebar -->
      <div class="dat-sidebar">
        <div class="dat-sidebar-logo" style="justify-content: space-between;">
          <div style="display:flex; align-items:center; gap: 10px;">
            <div
              style="
                background: #2563eb;
                color: white;
                font-weight: 900;
                font-size: 1.5rem;
                padding: 8px 12px;
                line-height: 1;
                letter-spacing: -1px;
                border-radius: 4px;
              "
            >
              DAT
            </div>
            <div>
              <div style="color: white; font-weight: 800">One</div>
              <div style="font-size: 0.75rem; font-weight: 600">Freight</div>
            </div>
          </div>
          <button class="dat-sidebar-close-btn" onclick="toggleDatSidebar()">✖</button>
        </div>
        <div class="dat-nav">
          <div
            class="dat-nav-item active"
            id="nav-dashboard"
            onclick="datNav('dashboard')"
          >
            <span style="font-size: 1.2rem">⌂</span> Dashboard
          </div>
          <div class="dat-nav-item" id="nav-search" onclick="datNav('search')">
            <span style="font-size: 1.2rem">🔍</span> Search Loads
          </div>
          <div class="dat-nav-item" id="nav-trucks" onclick="datNav('trucks')">
            <span style="font-size: 1.2rem">🚛</span> My Trucks (Active)
          </div>
          <div class="dat-nav-item" id="nav-loads" onclick="datNav('loads')">
            <span style="font-size: 1.2rem">📦</span> My Loads
          </div>
          <div
            class="dat-nav-item"
            id="nav-network"
            onclick="datNav('network')"
          >
            <span style="font-size: 1.2rem">🔒</span> Private Network
          </div>
          <div class="dat-nav-item" id="nav-tools" onclick="datNav('tools')">
            <span style="font-size: 1.2rem">🛠</span> Tools
          </div>
        </div>
        <div class="dat-bottom-nav">
          <div class="dat-nav-item"><span>🔔</span> Notifications</div>
          <div class="dat-nav-item"><span>❓</span> Support ⌄</div>
          <div class="dat-nav-item"><span>👤</span> My Account ⌄</div>
          <div class="dat-nav-item" onclick="logoutSimulator()" style="color: #ef4444;"><span>🚪</span> Logout</div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="dat-main">
        <!-- Dashboard View -->
        <div id="dat-view-dashboard" class="sub-view active">
          <div class="dashboard-header">Dashboard</div>
          <div class="dashboard-content">
            <div class="dashboard-main-col">
              <div class="dashboard-action-btns">
                <button class="dash-action-btn" onclick="datNav('post_truck')">⊕ POST A TRUCK</button>
                <button class="dash-action-btn" onclick="datNav('search')">
                  🔍 SEARCH LOADS
                </button>
                <button class="dash-action-btn" onclick="datNav('trucks')">🔍 SEARCH TRUCKS</button>
              </div>

              <div class="dash-cards-row">
                <div class="dash-card">
                  <h3 style="margin-top: 0; font-size: 0.9rem">
                    DAT One Mobile
                  </h3>
                  <p style="color: #64748b; font-size: 0.8rem">
                    The Most Loads Available. Real Loads, Real Money,
                    GUARANTEED!
                  </p>
                  <a
                    href="#"
                    style="
                      color: #0044cc;
                      font-size: 0.8rem;
                      font-weight: 700;
                      text-decoration: none;
                    "
                    >GET THE APP ></a
                  >
                </div>
                <div class="dash-card">
                  <h3 style="margin-top: 0; font-size: 0.9rem">Help Center</h3>
                  <p style="color: #64748b; font-size: 0.8rem">
                    Contact information, trouble shooting, FAQ's, and training
                    videos.
                  </p>
                  <a
                    href="#"
                    style="
                      color: #0044cc;
                      font-size: 0.8rem;
                      font-weight: 700;
                      text-decoration: none;
                    "
                    >HELP CENTER ></a
                  >
                </div>
              </div>

              <!-- Recommended Loads Widget -->
              <div
                class="recommended-loads-container"
                style="
                  background: white;
                  border: 1px solid #e2e8f0;
                  border-radius: 8px;
                  padding: 25px;
                  margin-top: 25px;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                "
              >
                <div
                  style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #f1f5f9;
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                  "
                >
                  <div>
                    <h3
                      style="
                        margin: 0;
                        font-size: 1.1rem;
                        font-weight: 800;
                        color: #1e293b;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                      "
                    >
                      ✨ Recommended Loads
                      <span
                        style="
                          background: #eff6ff;
                          color: #2563eb;
                          font-size: 0.7rem;
                          font-weight: bold;
                          padding: 3px 8px;
                          border-radius: 12px;
                          text-transform: uppercase;
                          letter-spacing: 0.5px;
                        "
                        >Tailored Match</span
                      >
                    </h3>
                    <p
                      style="
                        margin: 5px 0 0 0;
                        font-size: 0.8rem;
                        color: #64748b;
                      "
                    >
                      Freshly matched with your active trucks' types and
                      locations.
                    </p>
                  </div>
                  <button
                    onclick="regenerateRecommendedLoads()"
                    id="re-rec-btn"
                    style="
                      background: #2563eb;
                      color: white;
                      border: none;
                      padding: 8px 16px;
                      border-radius: 6px;
                      font-size: 0.75rem;
                      font-weight: bold;
                      cursor: pointer;
                      display: flex;
                      align-items: center;
                      gap: 6px;
                      transition:
                        background-color 0.2s,
                        transform 0.1s;
                      outline: none;
                      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
                    "
                    onmouseover="this.style.background = '#1d4ed8'"
                    onmouseout="this.style.background = '#2563eb'"
                  >
                    Regenerate Loads
                  </button>
                </div>

                <div
                  id="recommended-loads-loading"
                  style="
                    display: none;
                    padding: 40px 20px;
                    text-align: center;
                    color: #64748b;
                    font-size: 0.9rem;
                  "
                >
                  <div
                    style="
                      font-size: 2.5rem;
                      margin-bottom: 15px;
                      display: inline-block;
                      animation: spin 1s linear infinite;
                    "
                  >
                    🔄
                  </div>
                  <div>
                  Matching your active trucks with high-paying loads...
                  </div>
                </div>

                <div
                  class="table-container"
                  style="border-top: none; overflow: visible; margin-top: 10px"
                  id="recommended-loads-table-container"
                >
                  <table class="dat-table" style="width: 100%">
                    <thead>
                      <tr
                        style="border-bottom: 2px solid #e2e8f0; color: #64748b"
                      >
                        <th style="padding: 10px; font-size: 0.75rem">Age</th>
                        <th style="padding: 10px; font-size: 0.75rem">Rate</th>
                        <th style="padding: 10px; font-size: 0.75rem">Miles</th>
                        <th style="padding: 10px; font-size: 0.75rem">
                          Origin
                        </th>
                        <th style="padding: 10px; font-size: 0.75rem"></th>
                        <th style="padding: 10px; font-size: 0.75rem">
                          Destination
                        </th>
                        <th style="padding: 10px; font-size: 0.75rem">
                          Pickup
                        </th>
                        <th style="padding: 10px; font-size: 0.75rem">
                          Equipment
                        </th>
                        <th style="padding: 10px; font-size: 0.75rem">
                          Broker
                        </th>
                        <th style="padding: 10px; font-size: 0.75rem">Phone</th>
                        <th
                          style="
                            padding: 10px;
                            font-size: 0.75rem;
                            text-align: center;
                          "
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody id="recommended-loads-tbody">
                      <!-- Dynamically rendered by JS -->
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="dash-whats-new">
                <h3 style="margin-top: 0; font-size: 1rem">What's New</h3>

                <div style="margin-top: 20px">
                  <div
                    style="font-size: 0.8rem; font-weight: 700; color: #64748b"
                  >
                    NEW December 17th, 2024
                  </div>
                  <ul
                    style="
                      font-size: 0.85rem;
                      color: #1e293b;
                      padding-left: 20px;
                    "
                  >
                    <li>
                      Carriers can now use <strong>Quick Post</strong> when
                      posting trucks using smaller screens.
                    </li>
                  </ul>
                </div>

                <div style="margin-top: 20px">
                  <div
                    style="font-size: 0.8rem; font-weight: 700; color: #64748b"
                  >
                    November 21st, 2024
                  </div>
                  <ul
                    style="
                      font-size: 0.85rem;
                      color: #1e293b;
                      padding-left: 20px;
                    "
                  >
                    <li>
                      Carriers can now have advanced sorting capabilities within
                      the Rate and Company columns.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="dashboard-side-col">
              <div class="nat-load-header">
                <div
                  style="
                    display: inline-block;
                    background: #0044cc;
                    color: white;
                    font-weight: 900;
                    font-size: 1.5rem;
                    letter-spacing: 2px;
                    padding: 2px 8px;
                    border-radius: 2px;
                  "
                >
                  D A T
                </div>
                <div
                  style="font-weight: 900; font-size: 1.4rem; margin-top: 8px"
                >
                  National Loads Count
                </div>
                <div
                  style="
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 500;
                    margin-top: 4px;
                  "
                >
                  Where the Loads Are
                </div>
              </div>

              <div style="padding: 10px 20px">
                <div
                  style="
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #475569;
                    font-size: 0.75rem;
                    font-weight: 600;
                    margin-bottom: 10px;
                  "
                >
                  <span style="font-size: 1.1rem">↻</span> refreshed at 12:28 PM
                </div>
                <select
                  id="nat-loads-equipment"
                  style="
                    width: 100%;
                    border: 1px solid #94a3b8;
                    border-radius: 4px;
                    padding: 10px 12px;
                    font-size: 0.85rem;
                    color: #1e293b;
                    font-weight: 500;
                    background: white;
                    cursor: pointer;
                  "
                >
                  <option>Vans (Standard)</option>
                  <option>Reefers</option>
                  <option>Flatbeds</option>
                  <option>Power Only</option>
                  <option>Hotshot</option>
                </select>
              </div>

              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  color: #0f172a;
                  font-weight: 800;
                  font-size: 0.7rem;
                  letter-spacing: 1px;
                  padding: 10px 20px;
                  border-bottom: 1px solid #e2e8f0;
                  margin-bottom: 10px;
                "
              >
                <span>ST</span><span>LOADS IN</span><span>LOADS OUT</span>
              </div>

              <div class="nat-load-list" id="sim-nat-loads-list">
                <!-- JS injected 50 states -->
              </div>
            </div>
          </div>
        </div>

        <!-- Search Loads View -->
        <div id="dat-view-search" class="sub-view">
          <!-- Multi-Tab Search Area -->
          <div class="search-tabs-bar" id="search-tabs-bar">
            <!-- Tabs rendered by JS -->
          </div>

          <!-- Search Input Form -->
          <div class="search-section">
            <div class="search-row">
              <div class="input-box origin-dest">
                <span class="input-label">Origin</span>
                <input
                  type="text"
                  id="sim-search-origin"
                  placeholder="City, State or Zip"
                />
                <div class="autocomplete-list" id="autocomplete-origin"></div>
              </div>

              <div class="input-box dh">
                <span class="input-label">DH-O</span>
                <input
                  type="number"
                  id="sim-filter-dho"
                  value="150"
                  style="text-align: center"
                />
              </div>

              <div
                style="
                  color: #3b82f6;
                  font-weight: 900;
                  padding: 0 2px;
                  cursor: pointer;
                  font-size: 1.1rem;
                "
              >
                ⇄
              </div>

              <div class="input-box origin-dest">
                <span class="input-label">Destination</span>
                <input
                  type="text"
                  id="sim-search-dest"
                  placeholder="City, State or Zip"
                />
                <div class="autocomplete-list" id="autocomplete-dest"></div>
              </div>

              <div class="input-box dh">
                <span class="input-label">DH-D</span>
                <input
                  type="number"
                  id="sim-filter-dhd"
                  value="150"
                  style="text-align: center"
                />
              </div>
            </div>

            <div class="search-row">
              <div
                class="input-box dropdown custom-dropdown"
                tabindex="0"
                id="equip-dropdown-container"
                style="width: 200px"
              >
                <span class="input-label">Equipment Type*</span>
                <div class="dropdown-selected" id="sim-search-equip-display">
                  Vans (Standard)
                </div>
                <input type="hidden" id="sim-search-equip" value="Dry Van" />

                <div class="custom-dropdown-list" style="min-width: 240px">
                  <div class="cd-item cd-all">ALL</div>
                  <div class="cd-item active" data-val="Dry Van">
                    <span>Vans (Standard)</span
                    ><span class="cd-shortcut">V</span>
                  </div>
                  <div class="cd-item" data-val="Flatbed">
                    <span>Flatbeds</span><span class="cd-shortcut">F</span>
                  </div>
                  <div class="cd-item" data-val="Reefer">
                    <span>Reefers</span><span class="cd-shortcut">R</span>
                  </div>
                  <div class="cd-item" data-val="Conestoga">
                    <span>Conestogas</span><span class="cd-shortcut">N</span>
                  </div>
                  <div class="cd-item" data-val="Container">
                    <span>Containers</span><span class="cd-shortcut">C</span>
                  </div>
                  <div class="cd-item" data-val="Decks Spec">
                    <span>Decks (Specialized)</span
                    ><span class="cd-shortcut">K</span>
                  </div>
                  <div class="cd-item" data-val="Decks Std">
                    <span>Decks (Standard)</span
                    ><span class="cd-shortcut">D</span>
                  </div>
                </div>
              </div>

              <div
                class="input-box dropdown custom-dropdown"
                tabindex="0"
                id="loadtype-dropdown-container"
                style="width: 140px"
              >
                <span class="input-label">Load Type</span>
                <div class="dropdown-selected" id="sim-filter-loadtype-display">
                  Full & Partial
                </div>
                <input type="hidden" id="sim-filter-loadtype" value="Full" />

                <div class="custom-dropdown-list" style="min-width: 140px">
                  <div class="cd-item active" data-val="Full">
                    Full & Partial
                  </div>
                  <div class="cd-item" data-val="FullOnly">Full</div>
                  <div class="cd-item" data-val="Partial">Partial</div>
                </div>
              </div>

              <div class="input-box" style="width: 100px">
                <span class="input-label">Length ft</span>
                <input type="number" id="sim-filter-length" placeholder="" />
              </div>

              <div class="input-box" style="width: 100px">
                <span class="input-label">Weight lbs</span>
                <input type="number" id="sim-filter-weight" placeholder="" />
              </div>

              <div class="input-box" style="width: 200px; position: relative">
                <span class="input-label">Date Range*</span>
                <input
                  type="date"
                  id="sim-filter-daterange"
                  oninput="saveCurrentInputs()"
                  style="padding-right: 10px"
                />
              </div>

              <button
                class="search-btn"
                id="sim-load-search-btn"
                onclick="executeSearch(event)"
              >
                🔍 SEARCH
              </button>
              <button
                class="search-btn"
                id="auto-scan-btn"
                onclick="toggleAutoScan(this)"
                style="background: #e2e8f0; color: #475569; margin-left: 10px;"
              >
                ⚡ Auto-Scan: OFF
              </button>
              <span
                style="
                  color: #64748b;
                  font-weight: bold;
                  font-size: 1.2rem;
                  margin-left: 8px;
                  cursor: pointer;
                "
                >⋮</span
              >
            </div>

            <div class="filters-row">
              <div
                class="filter-tag custom-dropdown"
                tabindex="0"
                id="filter-dropdown-req"
              >
                <span id="filter-req-display">LOAD REQUIREMENTS ▾</span>
                <div class="custom-dropdown-list" style="min-width: 200px">
                  <div class="cd-item">✅ Factoring Eligible</div>
                  <div class="cd-item">✅ TIA Member</div>
                  <div class="cd-item">✅ Assure</div>
                </div>
              </div>
              <div
                class="filter-tag custom-dropdown"
                tabindex="0"
                id="filter-dropdown-back"
              >
                <span id="filter-back-display">SEARCH BACK - 24 HRS ▾</span>
                <div class="custom-dropdown-list" style="min-width: 180px">
                  <div class="cd-item">2 Hours</div>
                  <div class="cd-item">8 Hours</div>
                  <div class="cd-item active">24 Hours</div>
                  <div class="cd-item">48 Hours</div>
                </div>
              </div>
              <div
                class="filter-tag custom-dropdown"
                tabindex="0"
                id="filter-dropdown-comp"
              >
                <span id="filter-comp-display">COMPANY ▾</span>
                <div class="custom-dropdown-list" style="min-width: 180px">
                  <div class="cd-item">Favorites Only</div>
                  <div class="cd-item">Exclude Blocked</div>
                </div>
              </div>
              <div
                class="filter-tag custom-dropdown"
                tabindex="0"
                id="filter-dropdown-priv"
              >
                <span id="filter-priv-display">PRIVATE LOADS ▾</span>
                <div class="custom-dropdown-list" style="min-width: 180px">
                  <div class="cd-item">All Loads</div>
                  <div class="cd-item">Private Only</div>
                </div>
              </div>
              <div
                class="filter-tag custom-dropdown"
                tabindex="0"
                id="filter-dropdown-book"
              >
                <span id="filter-book-display">BOOK/BID ▾</span>
                <div class="custom-dropdown-list" style="min-width: 180px">
                  <div class="cd-item">Show All</div>
                  <div class="cd-item">Book Now Only</div>
                  <div class="cd-item">Bid Loads Only</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            id="dat-search-empty"
            style="align-items: flex-start; padding-top: 20px"
          >
            <div class="empty-state-tabs">
              <div class="empty-tab active">SAVED SEARCHES</div>
              <div class="empty-tab">RECENT SEARCHES (1)</div>
            </div>

            <div
              style="
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
              "
            >
              <div
                style="
                  font-size: 2.2rem;
                  font-weight: 800;
                  color: #1e293b;
                  margin-bottom: 40px;
                  text-align: center;
                  line-height: 1.1;
                "
              ></div>

              <img
                src="save_search_graphic.png"
                style="
                  width: 500px;
                  display: block;
                  margin: 0 auto;
                  border-radius: 6px;
                  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                "
              />

              <p
                style="
                  color: #475569;
                  width: 400px;
                  text-align: center;
                  font-size: 1rem;
                  margin-top: 30px;
                  line-height: 1.5;
                "
              >
                Click the <strong>"Save Search"</strong> option in the drop down
                menu when you run a search and they will show up here for easy
                access.
              </p>
            </div>
          </div>

          <!-- Results State -->
          <div id="dat-search-results" style="display: none">
            <div class="results-stats-row">
              <div style="display: flex; align-items: center">
                <span
                  id="dat-results-num"
                  style="
                    background: #dbeafe;
                    color: #1e40af;
                    padding: 4px 10px;
                    font-weight: 800;
                    font-size: 1.1rem;
                    border-radius: 4px;
                  "
                  >467 Results</span
                >
                <span
                  style="
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 500;
                    margin-left: 12px;
                  "
                  >+3027 Similar Results</span
                >
              </div>
              <div
                style="
                  display: flex;
                  align-items: center;
                  gap: 24px;
                  font-size: 0.8rem;
                  font-weight: 800;
                  color: #1e293b;
                "
              >
                <span
                  ><span
                    style="color: #64748b; font-weight: 600; margin-right: 4px"
                    >LANE RATE:</span
                  >
                  $2,091
                  <span style="color: #64748b; font-weight: 600"
                    >($2.92/MI)</span
                  ></span
                >
                <span
                  ><span
                    style="color: #64748b; font-weight: 600; margin-right: 4px"
                    >TRI-HAUL:</span
                  >
                  <span style="color: #16a34a">+$1647</span></span
                >
              </div>
            </div>

            <div class="table-container">
              <table class="dat-table">
                <thead>
                  <tr>
                    <th class="col-checkbox"><input type="checkbox" /></th>
                    <th>Age</th>
                    <th>Rate</th>
                    <th>ⓘ</th>
                    <th>Trip</th>
                    <th>Origin</th>
                    <th>DH-O</th>
                    <th>Destination</th>
                    <th>DH-D</th>
                    <th>Pick Up</th>
                    <th>Equipment ▾</th>
                    <th>Company</th>
                    <th>Contact</th>
                    <th>CS<br />DTP ▾</th>
                  </tr>
                </thead>
                <tbody id="sim-loads-tbody">
                  <!-- Loads injected here by JS -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- My Trucks / Active Dispatches View -->
        <div id="dat-view-trucks" class="sub-view" style="padding: 30px">
          <div id="posted-trucks-section" style="margin-bottom: 40px;">
            <h2 style="font-weight: 800; font-size: 1.5rem; margin: 0 0 15px 0">
              My Posted Trucks
            </h2>
            <div id="posted-trucks-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
              <div style="color: #64748b; font-size: 0.9rem;">Loading posted trucks...</div>
            </div>
          </div>

          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
            "
          >
            <h2 style="font-weight: 800; font-size: 1.5rem; margin: 0">
              Active Dispatches
            </h2>
            <button
              onclick="simulateCrisisEvent()"
              style="
                background: #ef4444;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 4px;
                font-weight: bold;
                cursor: pointer;
              "
            >
              [TEST] Trigger Crisis
            </button>
          </div>

          <div
            id="trucks-container"
            style="
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 20px;
            "
          >
            <!-- JS Injected Trucks -->
          </div>
        </div>

        <!-- Post a Truck View -->
        <div id="dat-view-post-truck" class="sub-view" style="padding: 30px">
          <h2 style="font-weight: 800; font-size: 1.5rem; margin: 0 0 20px 0">Post a Truck</h2>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; max-width: 800px;">
            <div style="display: flex; gap: 15px; margin-bottom: 15px;">
              <div style="flex: 1; position: relative;">
                <label style="font-size: 0.85rem; font-weight: bold; color: #64748b; display:block; margin-bottom:5px;">Origin (City, ST)</label>
                <input type="text" id="post-origin" placeholder="e.g. Dallas, TX" autocomplete="off" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
                <div class="autocomplete-list" id="autocomplete-post-origin"></div>
              </div>
              <div style="flex: 1; position: relative;">
                <label style="font-size: 0.85rem; font-weight: bold; color: #64748b; display:block; margin-bottom:5px;">Destination</label>
                <input type="text" id="post-dest" placeholder="Anywhere" autocomplete="off" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
                <div class="autocomplete-list" id="autocomplete-post-dest"></div>
              </div>
            </div>
            <div style="display: flex; gap: 15px; margin-bottom: 20px;">
              <div style="flex: 1;">
                <label style="font-size: 0.85rem; font-weight: bold; color: #64748b; display:block; margin-bottom:5px;">Equipment</label>
                <select id="post-equip" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
                  <option value="Dry Van">Dry Van</option>
                  <option value="Reefer">Reefer</option>
                  <option value="Flatbed">Flatbed</option>
                  <option value="Power Only">Power Only</option>
                </select>
              </div>
              <div style="flex: 1;">
                <label style="font-size: 0.85rem; font-weight: bold; color: #64748b; display:block; margin-bottom:5px;">Date Available</label>
                <input type="text" id="post-date" value="Today" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
              </div>
            </div>
            <div style="text-align: right;">
              <button onclick="postTruckAction(event)" class="sim-btn-primary" style="background:#2563eb; padding: 12px 30px; font-weight: bold; font-size: 1rem; border-radius: 4px; border:none; color:white; cursor:pointer;">⊕ POST TRUCK</button>
            </div>
          </div>
        </div>

        <!-- My Loads View -->
        <div id="dat-view-loads" class="sub-view" style="padding: 30px">
          <h2 style="font-weight: 800; font-size: 1.5rem; margin: 0 0 20px 0">
            My Loads (History & Active)
          </h2>
          <div
            id="loads-container"
            style="
              background: white;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
            "
          >
            <p style="color: #64748b">Loading booked loads...</p>
          </div>
        </div>

        <!-- Private Network View -->
        <div id="dat-view-network" class="sub-view" style="padding: 30px">
          <h2 style="font-weight: 800; font-size: 1.5rem; margin: 0 0 20px 0">
            Private Network Directory
          </h2>

          <div
            style="
              background: white;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
            "
          >
            <div style="display: flex; gap: 10px; margin-bottom: 20px">
              <input
                type="text"
                placeholder="Search by MC#, DOT, or Company Name"
                style="
                  flex: 1;
                  padding: 10px;
                  border: 1px solid #cbd5e1;
                  border-radius: 4px;
                "
              />
              <button
                style="
                  background: #2563eb;
                  color: white;
                  border: none;
                  padding: 10px 20px;
                  border-radius: 4px;
                  font-weight: bold;
                  cursor: pointer;
                "
              >
                Search
              </button>
            </div>

            <div
              style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 15px;
              "
              id="network-container"
            >
              <!-- Mock Partner 1 -->
              <div
                style="
                  border: 1px solid #e2e8f0;
                  border-radius: 6px;
                  padding: 15px;
                "
              >
                <div
                  style="font-weight: bold; color: #1e3a8a; font-size: 1.1rem"
                >
                  TQL (Total Quality Logistics)
                </div>
                <div
                  style="font-size: 0.85rem; color: #64748b; margin-top: 5px"
                >
                  MC# 000000 • Cincinnati, OH
                </div>
                <div
                  style="
                    display: flex;
                    justify-content: space-between;
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 1px solid #f1f5f9;
                  "
                >
                  <div>
                    <div style="font-weight: bold; color: #10b981">98</div>
                    <div style="font-size: 0.7rem; color: #64748b">CREDIT</div>
                  </div>
                  <div>
                    <div style="font-weight: bold; color: #1e293b">28</div>
                    <div style="font-size: 0.7rem; color: #64748b">DTP</div>
                  </div>
                  <div>
                    <div style="font-weight: bold; color: #f59e0b">★★★☆☆</div>
                    <div style="font-size: 0.7rem; color: #64748b">RATING</div>
                  </div>
                </div>
              </div>

              <!-- Mock Partner 2 -->
              <div
                style="
                  border: 1px solid #e2e8f0;
                  border-radius: 6px;
                  padding: 15px;
                "
              >
                <div
                  style="font-weight: bold; color: #1e3a8a; font-size: 1.1rem"
                >
                  C.H. Robinson
                </div>
                <div
                  style="font-size: 0.85rem; color: #64748b; margin-top: 5px"
                >
                  MC# 111111 • Eden Prairie, MN
                </div>
                <div
                  style="
                    display: flex;
                    justify-content: space-between;
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 1px solid #f1f5f9;
                  "
                >
                  <div>
                    <div style="font-weight: bold; color: #10b981">99</div>
                    <div style="font-size: 0.7rem; color: #64748b">CREDIT</div>
                  </div>
                  <div>
                    <div style="font-weight: bold; color: #1e293b">22</div>
                    <div style="font-size: 0.7rem; color: #64748b">DTP</div>
                  </div>
                  <div>
                    <div style="font-weight: bold; color: #f59e0b">★★★★☆</div>
                    <div style="font-size: 0.7rem; color: #64748b">RATING</div>
                  </div>
                </div>
              </div>

              <!-- Mock Partner 3 -->
              <div
                style="
                  border: 1px solid #e2e8f0;
                  border-radius: 6px;
                  padding: 15px;
                "
              >
                <div
                  style="font-weight: bold; color: #1e3a8a; font-size: 1.1rem"
                >
                  Coyote Logistics
                </div>
                <div
                  style="font-size: 0.85rem; color: #64748b; margin-top: 5px"
                >
                  MC# 222222 • Chicago, IL
                </div>
                <div
                  style="
                    display: flex;
                    justify-content: space-between;
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 1px solid #f1f5f9;
                  "
                >
                  <div>
                    <div style="font-weight: bold; color: #10b981">95</div>
                    <div style="font-size: 0.7rem; color: #64748b">CREDIT</div>
                  </div>
                  <div>
                    <div style="font-weight: bold; color: #1e293b">26</div>
                    <div style="font-size: 0.7rem; color: #64748b">DTP</div>
                  </div>
                  <div>
                    <div style="font-weight: bold; color: #f59e0b">★★★★☆</div>
                    <div style="font-size: 0.7rem; color: #64748b">RATING</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tools View -->
        <div id="dat-view-tools" class="sub-view" style="padding: 30px">
          <h2 style="font-weight: 800; font-size: 1.5rem; margin: 0 0 20px 0">
            Broker & Carrier Tools
          </h2>

          <div
            style="
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
              gap: 20px;
            "
          >
            <div
              style="
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                cursor: pointer;
                transition: 0.2s;
              "
              onmouseover="this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'"
              onmouseout="this.style.boxShadow = 'none'"
            >
              <div style="font-size: 3rem; margin-bottom: 10px">📈</div>
              <h3 style="margin: 0 0 10px 0; color: #1e293b">RateMate</h3>
              <p style="font-size: 0.85rem; color: #64748b; margin: 0">
                Access historical and 15-day average market rates.
              </p>
            </div>
            <div
              style="
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                cursor: pointer;
                transition: 0.2s;
              "
              onmouseover="this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'"
              onmouseout="this.style.boxShadow = 'none'"
            >
              <div style="font-size: 3rem; margin-bottom: 10px">🗺️</div>
              <h3 style="margin: 0 0 10px 0; color: #1e293b">LaneMakers</h3>
              <p style="font-size: 0.85rem; color: #64748b; margin: 0">
                Discover which brokers have the most volume in any lane.
              </p>
            </div>
            <div
              style="
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                cursor: pointer;
                transition: 0.2s;
              "
              onmouseover="this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'"
              onmouseout="this.style.boxShadow = 'none'"
            >
              <div style="font-size: 3rem; margin-bottom: 10px">⛽</div>
              <h3 style="margin: 0 0 10px 0; color: #1e293b">
                IFTA Calculator
              </h3>
              <p style="font-size: 0.85rem; color: #64748b; margin: 0">
                Calculate your state-by-state fuel taxes automatically.
              </p>
            </div>
            <div
              style="
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                cursor: pointer;
                transition: 0.2s;
              "
              onmouseover="this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'"
              onmouseout="this.style.boxShadow = 'none'"
            >
              <div style="font-size: 3rem; margin-bottom: 10px">⏱️</div>
              <h3 style="margin: 0 0 10px 0; color: #1e293b">
                Detention Tracking
              </h3>
              <p style="font-size: 0.85rem; color: #64748b; margin: 0">
                Log arrival times to enforce detention pay easily.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scripting -->
    

    <!-- AI Call Simulator Modal -->
    <div id="ai-call-modal" class="ai-modal-overlay">
      <div class="ai-modal">
        <div class="ai-modal-header">
          <h3 style="margin: 0">📞 Call Simulator</h3>
          <span
            style="cursor: pointer; font-size: 1.2rem"
            onclick="
              document.getElementById('ai-call-modal').style.display = 'none'
            "
            >✖</span
          >
        </div>
        <div
          class="ai-modal-body"
          id="ai-call-transcript"
          style="
            display: flex;
            flex-direction: column;
            background: #f8fafc;
            min-height: 300px;
          "
        >
          <div
            style="text-align: center; color: #64748b; margin-top: 20px"
            id="ai-call-status"
          >
            Connecting...
          </div>
        </div>
        <div
          style="
            padding: 15px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            gap: 10px;
            background: white;
          "
        >
          <button
            class="ai-btn"
            id="ai-call-btn"
            style="
              flex: 1;
              background: #10b981;
              font-size: 1.1rem;
              padding: 12px;
            "
            onclick="toggleVoiceRecognition()"
          >
            🎙️ Click to Speak
          </button>
        </div>
      </div>
    </div>

    <!-- Load Booked Success Modal -->
    <div id="ai-booked-modal" class="ai-modal-overlay">
      <div class="ai-modal" style="max-width: 500px">
        <div class="ai-modal-header" style="background: #10b981">
          <h3 style="margin: 0">🎉 Load Booked Successfully!</h3>
          <span
            style="cursor: pointer; font-size: 1.2rem"
            onclick="
              document.getElementById('ai-booked-modal').style.display = 'none'
            "
            >✖</span
          >
        </div>
        <div class="ai-modal-body" style="text-align: center">
          <p style="font-size: 1.1rem; color: #334155; margin-bottom: 20px">
            Congratulations! You successfully negotiated and booked this load.
            The following documents have been generated:
          </p>
          <!-- Score badge injected here by JS -->
          <div id="booked-score-badge"></div>
          <div
            style="
              display: flex;
              flex-direction: column;
              gap: 10px;
              align-items: center;
            "
          >
            <button
              class="ai-btn"
              style="
                width: 80%;
                background: #f8fafc;
                color: #0f172a;
                border: 1px solid #cbd5e1;
              "
              onclick="generateAndShowDoc('rate_con')"
            >
              📄 Rate Confirmation
            </button>
            <button
              class="ai-btn"
              style="
                width: 80%;
                background: #f8fafc;
                color: #0f172a;
                border: 1px solid #cbd5e1;
              "
              onclick="generateAndShowDoc('setup_packet')"
            >
              📄 Broker Setup Packet
            </button>
            <button
              class="ai-btn"
              style="
                width: 80%;
                background: #f8fafc;
                color: #0f172a;
                border: 1px solid #cbd5e1;
              "
              onclick="generateAndShowDoc('dispatch')"
            >
              📄 Dispatch Sheet
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Document Modal -->
    <div
      id="doc-modal"
      style="
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        justify-content: center;
        align-items: center;
      "
    >
      <div
        style="
          background: #f4f5f7;
          width: 90%;
          max-width: 900px;
          height: 90%;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        "
      >
        <div
          style="
            background: #333;
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <div style="font-weight: bold">Document Viewer</div>
          <div>
            <button
              style="
                background: #0052cc;
                color: white;
                border: none;
                padding: 5px 15px;
                border-radius: 4px;
                margin-right: 10px;
                cursor: pointer;
              "
              onclick="window.print()"
            >
              Print / Save PDF
            </button>
            <button
              style="
                background: transparent;
                color: white;
                border: none;
                cursor: pointer;
                font-size: 20px;
              "
              onclick="closeDoc()"
            >
              &times;
            </button>
          </div>
        </div>
        <div id="doc-content" style="flex: 1; overflow-y: auto; padding: 20px">
          <!-- Document renders here -->
        </div>
      </div>
    </div>
`

export default function DatSimulatorPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: inlineCSS }} />
      <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: bodyHTML }} />
      <Script src="/js/simulator.js" strategy="afterInteractive" />
      <Script src="/js/dat-simulator-page.js" strategy="afterInteractive" />
      <button
        onClick={() => { window.location.href = '/' }}
        style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 99999, padding: '12px 24px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 30, fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', transition: 'transform 0.2s', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Home size={18} /> Back to Dashboard
      </button>
    </>
  )
}
