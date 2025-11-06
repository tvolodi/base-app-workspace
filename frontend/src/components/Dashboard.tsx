import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Timeline } from 'primereact/timeline';
import { Panel } from 'primereact/panel';
import { Divider } from 'primereact/divider';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const [lineChartData, setLineChartData] = useState({});
  const [lineChartOptions, setLineChartOptions] = useState({});

  // Sample metrics data
  const metrics = [
    {
      title: 'Total Users',
      value: '2,543',
      change: '+12.5%',
      changeType: 'positive',
      icon: 'pi pi-users',
      color: 'primary'
    },
    {
      title: 'Active Sessions',
      value: '156',
      change: '+8.2%',
      changeType: 'positive',
      icon: 'pi pi-chart-line',
      color: 'success'
    },
    {
      title: 'Revenue',
      value: '$45,678',
      change: '-3.1%',
      changeType: 'negative',
      icon: 'pi pi-dollar',
      color: 'warning'
    },
    {
      title: 'Pending Tasks',
      value: '23',
      change: '-15%',
      changeType: 'positive',
      icon: 'pi pi-inbox',
      color: 'info'
    }
  ];

  // Sample recent activities
  const activities = [
    {
      status: 'User Registration',
      date: '2 hours ago',
      icon: 'pi pi-user-plus',
      color: '#9C27B0',
      description: 'New user john.doe registered'
    },
    {
      status: 'System Update',
      date: '5 hours ago',
      icon: 'pi pi-sync',
      color: '#673AB7',
      description: 'System updated to version 2.1.0'
    },
    {
      status: 'Data Export',
      date: '1 day ago',
      icon: 'pi pi-download',
      color: '#FF9800',
      description: 'Monthly report exported successfully'
    },
    {
      status: 'Security Alert',
      date: '2 days ago',
      icon: 'pi pi-shield',
      color: '#F44336',
      description: 'Unusual login attempt detected'
    },
    {
      status: 'Backup Complete',
      date: '3 days ago',
      icon: 'pi pi-database',
      color: '#4CAF50',
      description: 'Daily backup completed'
    }
  ];

  // Sample quick actions
  const quickActions = [
    { label: 'Create User', icon: 'pi pi-user-plus', color: 'primary' },
    { label: 'Generate Report', icon: 'pi pi-file-pdf', color: 'success' },
    { label: 'Settings', icon: 'pi pi-cog', color: 'info' },
    { label: 'Support', icon: 'pi pi-question-circle', color: 'help' }
  ];

  // Sample project progress
  const projects = [
    { name: 'Website Redesign', progress: 75, status: 'In Progress' },
    { name: 'Mobile App', progress: 45, status: 'In Progress' },
    { name: 'API Integration', progress: 90, status: 'Almost Done' },
    { name: 'Security Audit', progress: 30, status: 'Started' }
  ];

  useEffect(() => {
    // Bar Chart Configuration
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    const data = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [
        {
          label: 'Revenue',
          backgroundColor: documentStyle.getPropertyValue('--blue-500'),
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          data: [65, 59, 80, 81, 56, 55, 70]
        },
        {
          label: 'Expenses',
          backgroundColor: documentStyle.getPropertyValue('--pink-500'),
          borderColor: documentStyle.getPropertyValue('--pink-500'),
          data: [28, 48, 40, 19, 86, 27, 50]
        }
      ]
    };

    const options = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            fontColor: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500
            }
          },
          grid: {
            display: false,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };

    // Line Chart Configuration
    const lineData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Active Users',
          data: [540, 625, 580, 710, 695, 820, 750],
          fill: true,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          tension: 0.4
        },
        {
          label: 'Page Views',
          data: [1200, 1450, 1380, 1620, 1550, 1890, 1720],
          fill: true,
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: documentStyle.getPropertyValue('--purple-500'),
          tension: 0.4
        }
      ]
    };

    const lineOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };

    setChartData(data);
    setChartOptions(options);
    setLineChartData(lineData);
    setLineChartOptions(lineOptions);
  }, []);

  const customizedMarker = (item) => {
    return (
      <span className="custom-marker p-shadow-2" style={{ backgroundColor: item.color }}>
        <i className={item.icon}></i>
      </span>
    );
  };

  const customizedContent = (item) => {
    return (
      <Card className="activity-card">
        <div className="activity-content">
          <div className="activity-header">
            <strong>{item.status}</strong>
            <span className="activity-date">{item.date}</span>
          </div>
          <p className="activity-description">{item.description}</p>
        </div>
      </Card>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Welcome back, {user?.name || 'User'}! 👋</h1>
          <p>Here's what's happening with your workspace today.</p>
        </div>
        <Avatar 
          label={user?.name?.charAt(0).toUpperCase() || 'U'} 
          size="xlarge" 
          shape="circle" 
          className="welcome-avatar"
        />
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <Card key={index} className="metric-card">
            <div className="metric-content">
              <div className="metric-icon-wrapper" style={{ backgroundColor: `var(--${metric.color}-100)` }}>
                <i className={metric.icon} style={{ color: `var(--${metric.color}-500)`, fontSize: '2rem' }}></i>
              </div>
              <div className="metric-details">
                <span className="metric-title">{metric.title}</span>
                <h2 className="metric-value">{metric.value}</h2>
                <div className="metric-change">
                  <Tag 
                    value={metric.change} 
                    severity={metric.changeType === 'positive' ? 'success' : 'danger'}
                    icon={metric.changeType === 'positive' ? 'pi pi-arrow-up' : 'pi pi-arrow-down'}
                  />
                  <span className="metric-period">vs last month</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <Card title="Revenue vs Expenses" className="chart-card">
          <Chart type="bar" data={chartData} options={chartOptions} style={{ height: '300px' }} />
        </Card>

        <Card title="Weekly Analytics" className="chart-card">
          <Chart type="line" data={lineChartData} options={lineChartOptions} style={{ height: '300px' }} />
        </Card>
      </div>

      {/* Content Row */}
      <div className="content-row">
        {/* Recent Activity */}
        <Card title="Recent Activity" className="activity-panel">
          <Timeline 
            value={activities} 
            content={customizedContent}
            marker={customizedMarker}
            className="custom-timeline"
          />
        </Card>

        {/* Right Sidebar */}
        <div className="sidebar-panels">
          {/* Quick Actions */}
          <Panel header="Quick Actions" className="quick-actions-panel">
            <div className="quick-actions-grid">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  label={action.label}
                  icon={action.icon}
                  className={`p-button-${action.color} quick-action-btn`}
                  outlined
                />
              ))}
            </div>
          </Panel>

          {/* Project Progress */}
          <Panel header="Project Progress" className="projects-panel">
            <div className="projects-list">
              {projects.map((project, index) => (
                <div key={index} className="project-item">
                  <div className="project-header">
                    <span className="project-name">{project.name}</span>
                    <Badge value={`${project.progress}%`} severity="info" />
                  </div>
                  <ProgressBar value={project.progress} showValue={false} />
                  <span className="project-status">{project.status}</span>
                </div>
              ))}
            </div>
          </Panel>

          {/* System Status */}
          <Panel header="System Status" className="status-panel">
            <div className="status-items">
              <div className="status-item">
                <span className="status-label">CPU Usage</span>
                <div className="status-value">
                  <ProgressBar value={45} showValue={false} style={{ height: '8px' }} />
                  <span>45%</span>
                </div>
              </div>
              <Divider />
              <div className="status-item">
                <span className="status-label">Memory</span>
                <div className="status-value">
                  <ProgressBar value={68} showValue={false} style={{ height: '8px' }} />
                  <span>68%</span>
                </div>
              </div>
              <Divider />
              <div className="status-item">
                <span className="status-label">Storage</span>
                <div className="status-value">
                  <ProgressBar value={82} showValue={false} style={{ height: '8px' }} />
                  <span>82%</span>
                </div>
              </div>
              <Divider />
              <div className="status-item">
                <span className="status-label">Server Status</span>
                <Tag value="Online" severity="success" icon="pi pi-check-circle" />
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
