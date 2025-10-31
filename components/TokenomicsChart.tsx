import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Project } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface TokenomicsChartProps {
    tokenomics: Project['tokenomics'];
}

const TokenomicsChart: React.FC<TokenomicsChartProps> = ({ tokenomics }) => {
    if (!tokenomics) return null;

    const data = {
        labels: ['Team', 'Advisors', 'Public Sale'],
        datasets: [
            {
                label: '% Allocation',
                data: [tokenomics.team, tokenomics.advisors, tokenomics.publicSale],
                backgroundColor: [
                    'rgba(20, 184, 166, 0.7)', // teal-500
                    'rgba(100, 116, 139, 0.7)', // slate-500
                    'rgba(51, 65, 85, 0.7)',  // slate-700
                ],
                borderColor: [
                    '#14b8a6',
                    '#64748b',
                    '#334155',
                ],
                borderWidth: 1,
                hoverOffset: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '60%',
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: '#94a3b8', // slate-400
                    padding: 20,
                    font: {
                        size: 12,
                    }
                }
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1e293b', // bg-navy-800
                titleColor: '#e2e8f0', // slate-200
                bodyColor: '#cbd5e1', // slate-300
                padding: 10,
                cornerRadius: 4,
                callbacks: {
                    label: function(context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += context.parsed + '%';
                        }
                        return label;
                    }
                }
            }
        },
    };

    return <Doughnut data={data} options={options} />;
};

export default TokenomicsChart;
