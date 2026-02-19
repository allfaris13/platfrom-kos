"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, Download, Calendar, DollarSign, Loader2, BarChart3, Activity } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { api, Room, Payment as ApiPayment, DashboardStats } from '@/app/services/api';
import { Button } from '@/app/components/ui/button';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";

export function LuxuryReports() {
  const t = useTranslations('admin');
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<any[]>([]); // Add tenants state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pData, rData, sData, tData] = await Promise.all([
          api.getAllPayments(),
          api.getRooms(),
          api.getDashboardStats(),
          api.getAllTenants() // Fetch tenants
        ]);
        setPayments(pData);
        setRooms(rData);
        setStats(sData);
        // Handle paginated response for tenants
        if ('data' in tData) {
            setTenants(tData.data);
        } else {
            setTenants(tData as any[]);
        }
      } catch (e) {
        console.error("Failed to fetch reports data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, []);

  // Use backend-calculated values
  const totalRevenue = stats?.total_revenue || 0;
  const pendingRevenue = stats?.pending_revenue || 0;


  // Revenue by Room Type Data
  const revenueByType = stats?.type_breakdown || [];

  const tenantDemographics = stats?.demographics || [
    { name: '18-25', value: 33, color: '#f59e0b' },
    { name: '26-35', value: 45, color: '#3b82f6' },
    { name: '36-45', value: 15, color: '#10b981' },
    { name: '45+', value: 7, color: '#8b5cf6' }
  ];

  // Monthly Data from Backend


  const monthlyComparison = [
    { month: 'Jan', thisYear: 4200000, lastYear: 3800000 },
    { month: 'Feb', thisYear: 5100000, lastYear: 4500000 },
    { month: 'Mar', thisYear: 4800000, lastYear: 4200000 },
    { month: 'Apr', thisYear: 5400000, lastYear: 4900000 },
    { month: 'May', thisYear: 6200000, lastYear: 5500000 },
    { month: 'Jun', thisYear: 5900000, lastYear: 5200000 }
  ];

  const handleExport = async () => {
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // --- Header Section ---
    // Company Logo/Name
    doc.setFontSize(22);
    doc.setTextColor(245, 158, 11); // Amber 500
    doc.setFont("helvetica", "bold");
    doc.text("Kost Putra Rahmat ZAW", 14, 20);
    
    // Company Address (Subtext)
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("Pondok Alam, Jl. Sigura - Gura No.21 Blok A2,", 14, 26);
    doc.text("Karangbesuki, Kec. Sukun, Kota Malang, Jawa Timur 65149", 14, 30);
    doc.text("Phone: 08124911926", 14, 34);

    // Report Title & Date
    doc.setFontSize(16);
    doc.setTextColor(51, 65, 85); // Slate 700
    doc.setFont("helvetica", "bold");
    doc.text(t('financialReportsHead'), pageWidth - 14, 20, { align: "right" });
    
    const dateStr = new Date().toLocaleDateString("id-ID", { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(dateStr, pageWidth - 14, 26, { align: "right" });

    // Divider Line
    doc.setLineWidth(0.5);
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.line(14, 40, pageWidth - 14, 40);

    // --- Executive Summary Section ---
    const summaryY = 48;
    const boxWidth = (pageWidth - 28 - 10) / 3; // 3 boxes with gap
    const boxHeight = 25;

    // Box 1: Total Revenue
    doc.setFillColor(240, 253, 244); // Green 50
    doc.setDrawColor(220, 252, 231); // Green 100
    doc.roundedRect(14, summaryY, boxWidth, boxHeight, 3, 3, "FD");
    
    doc.setFontSize(9);
    doc.setTextColor(22, 163, 74); // Green 600
    doc.text(t('totalRevenue').toUpperCase(), 14 + 5, summaryY + 8);
    
    doc.setFontSize(14);
    doc.setTextColor(21, 128, 61); // Green 700
    doc.setFont("helvetica", "bold");
    doc.text(formatPrice(totalRevenue), 14 + 5, summaryY + 18);

    // Box 2: Pending Revenue
    doc.setFillColor(255, 251, 235); // Amber 50
    doc.setDrawColor(254, 243, 199); // Amber 100
    doc.roundedRect(14 + boxWidth + 5, summaryY, boxWidth, boxHeight, 3, 3, "FD");

    doc.setFontSize(9);
    doc.setTextColor(217, 119, 6); // Amber 600
    doc.setFont("helvetica", "normal");
    doc.text(t('pendingRevenue').toUpperCase(), 14 + boxWidth + 10, summaryY + 8);

    doc.setFontSize(14);
    doc.setTextColor(180, 83, 9); // Amber 700
    doc.setFont("helvetica", "bold");
    doc.text(formatPrice(pendingRevenue), 14 + boxWidth + 10, summaryY + 18);

    // Box 3: Occupancy Rate
    const occupancyRate = rooms.length > 0 ? Math.round((rooms.filter(r => r.status === 'Terisi').length / rooms.length) * 100) : 0;
    doc.setFillColor(239, 246, 255); // Blue 50
    doc.setDrawColor(219, 234, 254); // Blue 100
    doc.roundedRect(14 + (boxWidth * 2) + 10, summaryY, boxWidth, boxHeight, 3, 3, "FD");

    doc.setFontSize(9);
    doc.setTextColor(37, 99, 235); // Blue 600
    doc.setFont("helvetica", "normal");
    doc.text(t('occupancy').toUpperCase(), 14 + (boxWidth * 2) + 15, summaryY + 8);

    doc.setFontSize(14);
    doc.setTextColor(29, 78, 216); // Blue 700
    doc.setFont("helvetica", "bold");
    doc.text(`${occupancyRate}%`, 14 + (boxWidth * 2) + 15, summaryY + 18);

    // --- Transaction Details Table ---
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text(t('transactionDetails'), 14, 80);

    const tableColumn = [t('date'), t('tenantName'), t('roomType'), t('roomNo'), t('status'), t('amount')];
    const tableRows: (string | number)[][] = [];

    // Sort payments by date desc
    const sortedPayments = [...payments].sort((a, b) => 
      new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    );

    sortedPayments.forEach(p => {
      const rowData = [
        new Date(p.created_at || new Date().toISOString()).toLocaleDateString("id-ID"),
        p.pemesanan?.penyewa?.nama_lengkap || t('unknown'),
        p.pemesanan?.kamar?.tipe_kamar || '-',
        p.pemesanan?.kamar?.nomor_kamar || '-',
        p.status_pembayaran,
        formatPrice(p.jumlah_bayar)
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 85,
      theme: 'grid',
      headStyles: { 
        fillColor: [245, 158, 11], // Amber 500
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Date
        1: { cellWidth: 40 }, // Name
        2: { cellWidth: 25 }, // Type
        3: { cellWidth: 20, halign: 'center' }, // Room
        4: { cellWidth: 25, halign: 'center' }, // Status
        5: { cellWidth: 40, halign: 'right', fontStyle: 'bold' } // Amount
      },
      styles: { 
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Slate 50
      },
      didParseCell: function(data) {
        // Color code status column
        if (data.section === 'body' && data.column.index === 4) {
          const status = data.cell.raw;
          if (status === 'Confirmed') {
            data.cell.styles.textColor = [22, 163, 74]; // Green
          } else if (status === 'Pending') {
            data.cell.styles.textColor = [217, 119, 6]; // Amber
          } else {
            data.cell.styles.textColor = [220, 38, 38]; // Red
          }
        }
      },
      // Add footer to each page
      didDrawPage: function (data) {
        const str = 'Page ' + doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(str, pageWidth - 20, pageHeight - 10, { align: "right" });
        doc.text(`Generated by System on ${new Date().toLocaleString('id-ID')}`, 14, pageHeight - 10);
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // --- Page 2: Tenant & Guest Data ---
    doc.addPage();
    
    // Header for Page 2
    doc.setFontSize(22);
    doc.setTextColor(245, 158, 11);
    doc.setFont("helvetica", "bold");
    doc.text("Kost Putra Rahmat ZAW", 14, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(51, 65, 85);
    doc.text("Tenant & Guest Data", pageWidth - 14, 20, { align: "right" });
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 25, pageWidth - 14, 25);
    
    const tenantColumn = [t('id'), t('name'), t('role'), t('roomNo'), t('contact'), t('status')];
    const tenantRows: (string | number)[][] = [];

    tenants.forEach((tenant: any) => {
        const row = [
            tenant.id,
            tenant.nama_lengkap || tenant.user?.username || '-',
            tenant.role || 'Guest',
            tenant.kamar?.nomor_kamar || '-',
            tenant.nomor_hp || tenant.email || '-',
            tenant.status || 'Active'
        ];
        tenantRows.push(row);
    });

    autoTable(doc, {
        head: [tenantColumn],
        body: tenantRows,
        startY: 35,
        theme: 'grid',
        headStyles: { 
            fillColor: [37, 99, 235], // Blue 600
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        styles: { fontSize: 9, cellPadding: 3 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didDrawPage: function (data) {
            const str = 'Page ' + doc.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(str, pageWidth - 20, pageHeight - 10, { align: "right" });
            doc.text(`Generated by System on ${new Date().toLocaleString('id-ID')}`, 14, pageHeight - 10);
        }
    });

    doc.save(`Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `Rp ${(price / 1000000).toFixed(1).replace('.', ',')} jt`;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price).replace('Rp', 'Rp ');
  };

  interface TooltipPayload {
    value: number;
    name: string;
    color: string;
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">{label}</p>
          {payload.map((entry, index: number) => {
            const val = entry.value;
            return (
              <p key={index} className="text-slate-900 dark:text-white font-semibold flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name || 'Value'}: {formatPrice(val)}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-slate-950 gap-4">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-medium italic">{t('reportsLoading')}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-screen">
      {/* Header - Responsif stack di mobile */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 dark:from-amber-400 dark:via-amber-500 dark:to-amber-600 bg-clip-text text-transparent mb-2">
            {t('reportsTitle')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">{t('reportsSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs md:text-sm"
          >
            <Calendar className="size-4 mr-2" />
            {t('last6Months')}
          </Button>
          <Button
            onClick={handleExport}
            className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20 text-xs md:text-sm"
          >
            <Download className="size-4 mr-2" />
            {t('exportReport')}
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics - Grid responsif (2 kolom mobile, 4 kolom desktop) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
      >
        <div className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-green-200 dark:border-green-500/20 rounded-2xl p-4 md:p-6 hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-green-900/10 transition-all shadow-sm dark:shadow-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl dark:from-green-500/20" />
          <div className="relative">
            <div className="p-2 md:p-3 bg-green-100 dark:bg-green-500/20 rounded-xl w-fit mb-2 md:mb-4">
              <DollarSign className="size-4 md:size-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm mb-1">{t('totalRevenue')}</p>
            <p className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white mb-0.5 md:mb-1">{formatPrice(totalRevenue)}</p>
            <p className="text-[10px] text-green-600 dark:text-green-400">+12.5% {t('revenueGrowth')}</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-500/20 rounded-2xl p-4 md:p-6 hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-orange-900/10 transition-all shadow-sm dark:shadow-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-2xl dark:from-orange-500/20" />
          <div className="relative">
            <div className="p-2 md:p-3 bg-orange-100 dark:bg-orange-500/20 rounded-xl w-fit mb-2 md:mb-4">
              <TrendingUp className="size-4 md:size-6 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm mb-1">{t('pendingRevenue')}</p>
            <p className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white mb-0.5 md:mb-1">{formatPrice(pendingRevenue)}</p>
            <p className="text-[10px] text-orange-600 dark:text-orange-400">{t('waitConfirm')}</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4 md:p-6 hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-blue-900/10 transition-all shadow-sm dark:shadow-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl dark:from-blue-500/20" />
          <div className="relative">
            <div className="p-2 md:p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl w-fit mb-2 md:mb-4">
              <BarChart3 className="size-4 md:size-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm mb-1">{t('avgRate')}</p>
            <p className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white mb-0.5 md:mb-1">
              {formatPrice(rooms.length > 0 ? rooms.reduce((sum, r) => sum + (r.harga_per_bulan || 0), 0) / rooms.length : 0)}
            </p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400">{t('perMonth')}</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-500/20 rounded-2xl p-4 md:p-6 hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-purple-900/10 transition-all shadow-sm dark:shadow-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl dark:from-purple-500/20" />
          <div className="relative">
            <div className="p-2 md:p-3 bg-purple-100 dark:bg-purple-500/20 rounded-xl w-fit mb-2 md:mb-4">
              <Activity className="size-4 md:size-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm mb-1">{t('occupancy')}</p>
            <p className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white mb-0.5 md:mb-1">
              {rooms.length > 0 ? Math.round((rooms.filter(r => r.status === 'Terisi').length / rooms.length) * 100) : 0}%
            </p>
            <p className="text-[10px] text-purple-600 dark:text-purple-400">{rooms.filter(r => r.status === 'Terisi').length}/{rooms.length} rooms</p>
          </div>
        </div>
      </motion.div>

      {/* Charts Section - Stack di mobile, grid di desktop */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="grid grid-cols-1 xl:grid-cols-2 gap-6"
      >
        {/* Revenue by Room Type */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm dark:shadow-none">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">{t('revenueByRoomType')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('revenueByRoomTypeSubtitle')}</p>
          </div>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByType}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} vertical={false} />
                <XAxis dataKey="type" stroke="#64748b" style={{ fontSize: '10px' }} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" style={{ fontSize: '10px' }} tickLine={false} axisLine={false} tickFormatter={(value) => formatPrice(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tenant Demographics - Pie Chart Responsif */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm dark:shadow-none">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">{t('tenantDemographics')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('ageDistribution')}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-full sm:w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tenantDemographics}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={5}
                  >
                    {tenantDemographics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/2 space-y-2 md:space-y-3">
              {tenantDemographics.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs md:text-sm text-slate-600 dark:text-slate-300">{item.name} {t('years')}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Year-over-Year Comparison */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm dark:shadow-none"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">{t('monthlyRevenueTrend')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('monthlyRevenueTrendSubtitle')}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="size-3 bg-amber-500 rounded-full" />
              <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">{t('thisYear')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 bg-blue-500 rounded-full" />
              <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">{t('lastYear')}</span>
            </div>
          </div>
        </div>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.1} vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '10px' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" style={{ fontSize: '10px' }} axisLine={false} tickLine={false} tickFormatter={(value) => formatPrice(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="thisYear" name={t('thisYear')} fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="lastYear" name={t('lastYear')} fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Detailed Breakdown Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8"
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm dark:shadow-none">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{t('revenueBreakdown')}</h3>
          <div className="space-y-4">
            {revenueByType.map((item) => (
              <div key={item.type} className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl hover:border-amber-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm md:text-base">{item.type} Rooms</p>
                    <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">{item.occupied}/{item.count || 0} {t('occupiedCount')}</p>
                  </div>
                  <p className="text-base md:text-lg font-bold text-amber-600 dark:text-amber-400">{formatPrice(item.revenue)}</p>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                    style={{ width: `${item.count > 0 ? (item.occupied / item.count) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm dark:shadow-none">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{t('paymentStatus')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-200 dark:border-green-500/20 rounded-xl">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{t('confirmed')}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{payments.filter(p => p.status_pembayaran === 'Confirmed').length} {t('transactionCount')}</p>
              </div>
              <p className="text-lg md:text-xl font-bold text-green-600 dark:text-green-400">{formatPrice(totalRevenue)}</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-200 dark:border-orange-500/20 rounded-xl">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{t('pending')}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{payments.filter(p => p.status_pembayaran === 'Pending').length} {t('transactionCount')}</p>
              </div>
              <p className="text-lg md:text-xl font-bold text-orange-600 dark:text-orange-400">{formatPrice(pendingRevenue)}</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{t('totalPotential')}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('ifFullyOccupied')}</p>
              </div>
              <p className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(rooms.reduce((sum, r) => sum + (r.harga_per_bulan || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}