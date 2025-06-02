import React, { useCallback } from 'react'
import { CalculationResult, CalculationFormState } from '@/shared/types/models'
import { formatCurrency } from '../inputs/NumericInput'
import { formatTokens, formatTimeRounded, formatPercentage } from '@/shared/utils/formatting'
import { ChartDisplayRef } from './ChartDisplay'
import { CostChartRef } from './CostOverTimeChart'
import { svgToBase64Image } from '@/client/utils/chartExport'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'
import { getModelOptions } from '@/shared/utils/modelConfig'

interface ExportButtonProps {
  result: CalculationResult
  formState: CalculationFormState
  type: 'pdf' | 'json'
  costComparisonChart?: React.RefObject<ChartDisplayRef>
  timeAnalysisChart?: React.RefObject<ChartDisplayRef>
  costOverTimeChart?: React.RefObject<CostChartRef>
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  result,
  formState,
  type,
  costComparisonChart,
  timeAnalysisChart,
  costOverTimeChart
}) => {
  const getChartImages = useCallback(async () => {
    const images: { [key: string]: string } = {}

    try {
      if (costComparisonChart?.current) {
        const svg = costComparisonChart.current.getSvgElement()
        if (svg) {
          images.costComparison = await svgToBase64Image(svg)
        }
      }

      if (timeAnalysisChart?.current) {
        const svg = timeAnalysisChart.current.getSvgElement()
        if (svg) {
          images.timeAnalysis = await svgToBase64Image(svg)
        }
      }

      // Always include cost over time chart if available
      if (costOverTimeChart?.current) {
        const svg = costOverTimeChart.current.getSvgElement()
        if (svg) {
          images.costOverTime = await svgToBase64Image(svg)
        }
      }
    } catch (err) {
      console.error('Error generating chart images:', err)
    }

    return images
  }, [costComparisonChart, timeAnalysisChart, costOverTimeChart])

  const generatePDF = async () => {
    // Add a small delay to ensure charts are fully rendered
    await new Promise(resolve => setTimeout(resolve, 400))

    // Get chart images
    const chartImages = await getChartImages()
    const reportWindow = window.open('', '_blank')
    if (!reportWindow) {
      alert('Please allow popups to view the PDF report')
      return
    }

    // Create the HTML content for the report
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${result.customerName ? `${result.customerName} - ` : ''}Agentic Cost Analysis Report</title>
        <script>
          window.onload = function() {
            // Set filename for browser print dialog
            const date = new Date().toISOString().split('T')[0]
            const filename = ${result.customerName
              ? `'agentic-cost-analysis-${result.customerName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-' + date`
              : `'agentic-cost-analysis-' + date`}
            document.title = filename
            window.print()
          }
        </script>
        <style>
          @page {
            size: A3;
            margin: 10mm;
          }
          body { font-family: Arial, sans-serif; margin: 10px; }
          h1 { color: #2980b9; }
          h2 { color: #3498db; margin-top: 15px; }
          h3 { color: #2c3e50; }
          .section { margin-bottom: 15px; }
          .key-value { display: flex; margin-bottom: 10px; }
          .key { font-weight: bold; width: 200px; }
          .value { }
          .page-break { page-break-before: always; }
          .disclaimer { margin-top: 15px; font-size: 0.8em; color: #7f8c8d; }

          /* Table Styles */
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          th {
            background-color: #f8f9fa;
            text-align: left;
            padding: 6px 8px;
            font-weight: 600;
            border-bottom: 2px solid #e9ecef;
          }
          th:last-child {
            text-align: right;
          }
          td {
            padding: 6px 8px;
            border-bottom: 1px solid #e9ecef;
          }
          tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .currency-cell, .percentage-cell, .token-cell, .time-cell {
            text-align: right;
            font-weight: 500;
            color: #1F2937;
          }
          .dual-currency {
            display: flex;
            flex-direction: column;
          }
          .secondary-currency {
            font-size: 0.85em;
            color: #6c757d;
            margin-top: 2px;
          }

          /* Summary Cards Grid */
          .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 10px 0;
            page-break-inside: avoid;
          }
          .card {
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            page-break-inside: avoid;
          }
          .card-title {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 8px;
          }
          .card-value {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 4px;
          }
          .card-subtitle {
            font-size: 14px;
            margin-top: 4px;
          }
          .card-comparison {
            font-size: 14px;
            font-weight: 600;
            margin-top: 8px;
          }

          /* Card Colors */
          .card-blue { background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); border: 1px solid #BFDBFE; }
          .card-blue .card-title { color: #1E40AF; }
          .card-blue .card-value { color: #1E3A8A; }

          .card-teal { background: linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%); border: 1px solid #99F6E4; }
          .card-teal .card-title { color: #0F766E; }
          .card-teal .card-value { color: #134E4A; }

          .card-purple { background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%); border: 1px solid #DDD6FE; }
          .card-purple .card-title { color: #5B21B6; }
          .card-purple .card-value { color: #4C1D95; }

          .card-green { background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border: 1px solid #A7F3D0; }
          .card-green .card-title { color: #047857; }
          .card-green .card-value { color: #064E3B; }

          .card-emerald { background: linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 100%); border: 1px solid #6EE7B7; }
          .card-emerald .card-title { color: #047857; }
          .card-emerald .card-value { color: #064E3B; }

          .card-indigo { background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); border: 1px solid #C7D2FE; }
          .card-indigo .card-title { color: #4338CA; }
          .card-indigo .card-value { color: #3730A3; }
        </style>
      </head>
      <body>
        <h1>Agentic Cost Analysis Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString('en-AU')}</p>
        <div class="section" style="margin-bottom: 20px; padding: 15px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="margin-top: 0; color: #1e293b;">Project Information</h2>
          ${result.customerName ? `<div class="key-value"><div class="key">Customer:</div><div class="value">${result.customerName}</div></div>` : ''}
          ${result.projectName ? `<div class="key-value"><div class="key">Project:</div><div class="value">${result.projectName}</div></div>` : ''}
          ${formState.projectType ? `<div class="key-value"><div class="key">Project Type:</div><div class="value">${formState.projectType === 'oneoff' ? 'One-off Project' :
            formState.projectType === 'ongoing' ? 'Ongoing Usage' :
              'Combined Project'
          }</div></div>` : ''}
          ${result.projectDescription ? `
            <div style="margin-top: 15px;">
              <h3 style="margin-bottom: 8px;">Project Description</h3>
              <div style="margin: 0;">${unified()
                .use(remarkParse)
                .use(remarkGfm)
                .use(remarkHtml)
                .processSync(result.projectDescription)
                .toString()}</div>
            </div>
          ` : ''}
        </div>

        <div class="section" style="margin-bottom: 20px; padding: 15px; background-color: #fff7ed; border-radius: 8px; border: 1px solid #fed7aa;">
          <p style="margin: 0; color: #9a3412; font-style: italic;">${formState.globalParams?.disclaimerText ||
            "Estimates are based on industry standards for the gains seen from Agentic software development and token usage to support the calculations. Actual results will vary for each specific use case and implementation."}</p>
        </div>

        ${formState.projectType === 'both' ? `
          <h2>Project Implementation</h2>
        ` : ''}
        ${result.traditionalCost && result.agenticCost ? `
        <div class="section" style="margin-bottom: 30px;">
          <h3>Traditional (Manual) Development Approach Estimates</h3>
          <p style="margin-bottom: 15px;">Estimated cost and time without leveraging agentic AI capabilities.</p>
          <div class="cards-grid">
            <div class="card" style="background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%); border: 1px solid #FECACA;">
              <div class="card-title" style="color: #991B1B;">Traditional Cost</div>
              <div class="card-value" style="color: #7F1D1D;">${formatCurrency(result.traditionalCost.aud, 'AUD')} AUD</div>
              <div class="card-subtitle" style="color: #991B1B;">Manual development cost</div>
            </div>
            ${result.traditionalTime !== undefined ? `
            <div class="card" style="background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%); border: 1px solid #FECACA;">
              <div class="card-title" style="color: #991B1B;">Traditional Time</div>
              <div class="card-value" style="color: #7F1D1D;">${formatTimeRounded(result.traditionalTime)}</div>
              <div class="card-subtitle" style="color: #991B1B;">Manual development time</div>
            </div>
            ` : ''}
          </div>
        </div>

        <h3>Agentic Development Approach Estimates</h3>

        <p style="margin-bottom: 15px;">Estimated cost and time by leveraging our Agentic AI approach.</p>

        <div class="cards-grid" style="margin-bottom: 0;">
        ${result.fteEquivalentCost ? `
        <div class="card card-teal">
          <div class="card-title">AI Inference Cost (Cloud Spend)</div>
          <div class="card-value">${formatCurrency(result.agenticCost.inference.aud, 'AUD')}</div>
          <div class="card-subtitle">${formatCurrency(result.agenticCost.inference.usd, 'USD')} USD</div>
          <div class="card-subtitle">${formatPercentage((result.agenticCost.inference.aud) / (result.fteEquivalentCost.aud * 12) * 100)} equivalent FTE cost</div>
        </div>
        ` : ''}

        ${result.agenticCost ? `
          <div class="card card-teal">
            <div class="card-title">Total Cost (Inference + Developer Time)</div>
            <div class="card-value">${formatCurrency(result.agenticCost.total.aud, 'AUD')}</div>
            <div class="card-comparison">vs ${formatCurrency(result.traditionalCost.aud, 'AUD')}</div>
          </div>
        ` : ''}
        </div>

        <div class="cards-grid" style="margin-top: 20px;">
          ${result.savingsAnalysis !== undefined && result.agenticTime !== undefined ? `
          <div class="card card-purple">
            <div class="card-title">Reduced from ${formatTimeRounded(result.savingsAnalysis.timeInHours)}</div>
            <div class="card-value">to ${formatTimeRounded(result.agenticTime)}</div>
            <div class="card-subtitle">With Agentic AI</div>
          </div>
          ` : ''}

          ${result.savingsAnalysis || result.dailyCosts?.roiAnalysis ? `
          <div class="card card-purple">
          <div class="card-title">ROI of leveraging Agentic AI</div>
          <div class="card-value">${formatPercentage(result.savingsAnalysis?.roi ?? result.dailyCosts?.roiAnalysis?.roi ?? 0)}</div>
          <div class="card-subtitle">vs manual development</div>
          </div>
          ` : ''}
          ${result.savingsAnalysis ? `
          <div class="card card-purple">
            <div class="card-title">Cost Saving</div>
            <div class="card-value">${formatPercentage(result.savingsAnalysis.percentage)}</div>
            <div class="card-subtitle">leveraging Agentic AI vs manual development</div>
          </div>
          ` : ''}
          </div>
        ` : ''}

        ${formState.projectType === 'both' && result.dailyCosts ? `
          <h2 class="mt-8">Ongoing Run Cost</h2>
          <p style="margin-bottom: 15px;">The estimated ongoing run costs</p>
          <div class="cards-grid" style="margin-bottom: 0;">
            <div class="card card-blue">
              <div class="card-title">Monthly Ongoing Cost</div>
              <div class="card-value">${formatCurrency(result.dailyCosts.monthly.aud, 'AUD')}</div>
              <div class="card-subtitle">${formatCurrency(result.dailyCosts.monthly.usd, 'USD')} USD</div>
            </div>

            <div class="card card-blue">
              <div class="card-title">Annual Ongoing Cost</div>
              <div class="card-value">${formatCurrency(result.dailyCosts.yearly.aud, 'AUD')}</div>
              <div class="card-subtitle">${formatCurrency(result.dailyCosts.yearly.usd, 'USD')} USD</div>
            </div>

            ${result.agenticCost ? `
            <div class="card card-blue">
              <div class="card-title">Year 1 Total (Project+Ongoing) Cost</div>
              <div class="card-value">${formatCurrency(result.agenticCost.total.aud + result.dailyCosts.yearly.aud, 'AUD')}</div>
              <div class="card-subtitle">${formatCurrency(result.agenticCost.total.usd + result.dailyCosts.yearly.usd, 'USD')} USD</div>
            </div>
            ` : ''}
          </div>
          <div class="cards-grid" style="margin-top: 20px;">
            ${result.dailyCosts.roiAnalysis ? `
            <div class="card card-blue">
              <div class="card-title">Daily Cost per Dev (AUD)</div>
              <div class="card-value">${result.dailyCosts.perDev ? formatCurrency(result.dailyCosts.perDev.aud, 'AUD') : 'N/A'}</div>
              <div class="card-subtitle">${result.dailyCosts.perDev ? formatCurrency(result.dailyCosts.perDev.usd, 'USD') : 'N/A'} USD</div>
            </div>

            <div class="card card-purple">
              <div class="card-title">Daily ROI</div>
              <div class="card-value">${formatPercentage(result.dailyCosts.roiAnalysis.roi)}</div>
              <div class="card-subtitle">${result.dailyCosts.roiAnalysis.productivityGain}x productivity</div>
            </div>
            ` : ''}
          </div>
        ` : ''}



        <div class="page-break"></div>
        <div class="section">
          <h2>Summary</h2>

          ${formState.projectType === 'both' ? `
            <h3>One-off Project Costs</h3>
            <p style="margin-bottom: 15px; color: #64748b; font-style: italic;">Note: These project costs are for the initial implementation only. Future and follow-on projects need to be calculated separately.</p>
          ` : ''}

          ${result.traditionalCost && result.agenticCost ? `
            ${formState.projectType !== 'both' ? `<h3>Cost Comparison</h3>` : ''}
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Traditional Cost</td>
                  <td class="currency-cell">${formatCurrency(result.traditionalCost.aud, 'AUD')}</td>
                </tr>
                <tr>
                  <td>Agentic Cost</td>
                  <td class="currency-cell">${formatCurrency(result.agenticCost.total.aud, 'AUD')}</td>
                </tr>
                ${result.savingsAnalysis ? `
                <tr>
                  <td>Cost Savings</td>
                  <td class="currency-cell">${formatCurrency(result.savingsAnalysis.cost.aud, 'AUD')}</td>
                </tr>
                <tr>
                  <td>Savings Percentage</td>
                  <td class="percentage-cell">${result.savingsAnalysis.percentage.toFixed(1)}%</td>
                </tr>
                <tr>
                  <td>ROI</td>
                  <td class="percentage-cell">${result.savingsAnalysis.roi.toFixed(1)}%</td>
                </tr>
                ` : ''}
              </tbody>
            </table>
          ` : ''}

          ${result.dailyCosts ? `
            <h3>Ongoing Costs</h3>
            ${result.dailyCosts.breakdown?.product ? `
              <div style="margin-bottom: 24px; background-color: #F9FAFB; padding: 20px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <h4 style="color: #4B5563; margin: 0 0 10px;">Product Usage</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Daily</td>
                      <td class="currency-cell">${formatCurrency(result.dailyCosts.breakdown.product.total.aud, 'AUD')} / day</td>
                    </tr>
                    <tr>
                      <td>Monthly</td>
                      <td class="currency-cell">${formatCurrency(result.dailyCosts.breakdown.product.monthly.aud, 'AUD')} / month</td>
                    </tr>
                    <tr>
                      <td>Annual</td>
                      <td class="currency-cell">${formatCurrency(result.dailyCosts.breakdown.product.yearly.aud, 'AUD')} / year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ` : ''}

            ${result.dailyCosts.breakdown?.team ? `
              <div style="margin-bottom: 24px; background-color: #F9FAFB; padding: 20px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <h4 style="color: #4B5563; margin: 0 0 10px;">Developer Usage</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Daily</td>
                      <td class="currency-cell">${formatCurrency(result.dailyCosts.breakdown.team.total.aud, 'AUD')} / day</td>
                    </tr>
                    <tr>
                      <td>Monthly</td>
                      <td class="currency-cell">${formatCurrency(result.dailyCosts.breakdown.team.monthly.aud, 'AUD')} / month</td>
                    </tr>
                    <tr>
                      <td>Annual</td>
                      <td class="currency-cell">${formatCurrency(result.dailyCosts.breakdown.team.yearly.aud, 'AUD')} / year</td>
                    </tr>
                    ${result.dailyCosts.perDev ? `
                    <tr>
                      <td>Daily Cost per Dev</td>
                      <td class="currency-cell">${formatCurrency(result.dailyCosts.perDev.aud, 'AUD')} / dev / day</td>
                    </tr>
                    ` : ''}
                  </tbody>
                </table>
              </div>
            ` : ''}

            <div style="background-color: #EEF2FF; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h4 style="color: #4338CA; margin: 0 0 10px;">Total Ongoing Costs</h4>
              <table>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Daily Total</td>
                    <td class="currency-cell">${formatCurrency(result.dailyCosts.total.aud, 'AUD')} / day</td>
                  </tr>
                  <tr>
                    <td>Monthly Total</td>
                    <td class="currency-cell">${formatCurrency(result.dailyCosts.monthly.aud, 'AUD')} / month</td>
                  </tr>
                  <tr>
                    <td>Annual Total</td>
                    <td class="currency-cell">${formatCurrency(result.dailyCosts.yearly.aud, 'AUD')} / year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ` : ''}
        </div>

        <div class="section">
          <h2>Detailed Analysis</h2>

          ${formState.projectType === 'both' ? `
            <h3>Project Implementation Analysis</h3>
          ` : ''}

          ${result.traditionalCost && result.agenticCost ? `
            ${formState.projectType !== 'both' ? `
            <h3>Cost Breakdown</h3>` : ''}
            <table>
              <thead>
                <tr>
                  <th>Cost Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="2"><strong>Traditional Development</strong></td>
                </tr>
                <tr>
                  <td>Total Cost</td>
                  <td class="currency-cell">
                    <div class="dual-currency">
                      <div>${formatCurrency(result.traditionalCost.aud, 'AUD')}</div>
                      <div class="secondary-currency">${formatCurrency(result.traditionalCost.usd, 'USD')}</div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td colspan="2"><strong>Agentic Development</strong></td>
                </tr>
                <tr>
                  <td>Total Cost</td>
                  <td class="currency-cell">
                    <div class="dual-currency">
                      <div>${formatCurrency(result.agenticCost.total.aud, 'AUD')}</div>
                      <div class="secondary-currency">${formatCurrency(result.agenticCost.total.usd, 'USD')}</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Inference Cost</td>
                  <td class="currency-cell">
                    <div class="dual-currency">
                      <div>${formatCurrency(result.agenticCost.inference.aud, 'AUD')}</div>
                      <div class="secondary-currency">${formatCurrency(result.agenticCost.inference.usd, 'USD')}</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Human Cost</td>
                  <td class="currency-cell">${formatCurrency(result.agenticCost.human.aud, 'AUD')}</td>
                </tr>
              </tbody>
            </table>
          ` : ''}

          <h3>Model Configuration</h3>
          <table>
            <thead>
              <tr>
                <th>Setting</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Model</td>
                <td>${(() => {
                  const modelOptions = getModelOptions();
                  const primaryModel = formState.modelConfig?.primaryModel;
                  const secondaryModel = formState.modelConfig?.secondaryModel;
                  const ratio = formState.modelConfig?.modelRatio;

                  const primaryOption = modelOptions.find(option =>
                    option.profile.inputTokenCost1M === primaryModel?.inputTokenCost1M &&
                    option.profile.outputTokenCost1M === primaryModel?.outputTokenCost1M
                  );

                  if (!primaryOption) return 'Not specified';

                  if (!secondaryModel || !ratio) {
                    return primaryOption.label;
                  }

                  const secondaryOption = modelOptions.find(option =>
                    option.profile.inputTokenCost1M === secondaryModel?.inputTokenCost1M &&
                    option.profile.outputTokenCost1M === secondaryModel?.outputTokenCost1M
                  );

                  if (!secondaryOption) return primaryOption.label;

                  return `${primaryOption.label} (${Math.round(ratio * 100)}%) / ${secondaryOption.label} (${Math.round((1 - ratio) * 100)}%)`;
                })()}</td>
              </tr>
              <tr>
                <td>Input Token Cost</td>
                <td class="currency-cell">${formatCurrency(formState.modelConfig.primaryModel.inputTokenCost1M, 'USD')} / 1M tokens</td>
              </tr>
              <tr>
                <td>Output Token Cost</td>
                <td class="currency-cell">${formatCurrency(formState.modelConfig.primaryModel.outputTokenCost1M, 'USD')} / 1M tokens</td>
              </tr>
              <tr>
                <td>Cache Write Cost</td>
                <td class="currency-cell">${formatCurrency(formState.modelConfig.primaryModel.cacheWriteTokenCost1M, 'USD')} / 1M tokens</td>
              </tr>
              <tr>
                <td>Cache Read Cost</td>
                <td class="currency-cell">${formatCurrency(formState.modelConfig.primaryModel.cacheReadTokenCost1M, 'USD')} / 1M tokens</td>
              </tr>
            </tbody>
          </table>

          ${result.tokenUsage ? `
            ${formState.projectType === 'both' ? `
            <div class="section">
              <h3>Combined Token Usage (Project + Ongoing)</h3>
            </div>
            ` : `
            <h3>Token Usage</h3>
            `}
            <table>
              <thead>
                <tr>
                  <th>Token Type</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Input Tokens</td>
                  <td class="token-cell">${formatTokens(result.tokenUsage.input)}</td>
                </tr>
                <tr>
                  <td>Output Tokens</td>
                  <td class="token-cell">${formatTokens(result.tokenUsage.output)}</td>
                </tr>
                <tr>
                  <td>Cache Write Tokens</td>
                  <td class="token-cell">${formatTokens(result.tokenUsage.cacheWrite)}</td>
                </tr>
                <tr>
                  <td>Cache Read Tokens</td>
                  <td class="token-cell">${formatTokens(result.tokenUsage.cacheRead)}</td>
                </tr>
                ${result.tokenUsage.effectiveTotal ? `
                <tr>
                  <td>Effective Total</td>
                  <td class="token-cell">${formatTokens(result.tokenUsage.effectiveTotal)}</td>
                </tr>
                ` : ''}
                ${result.totalProjectTime ? `
                <tr>
                  <td>Average Tokens per 8hr Day</td>
                  <td class="token-cell">${formatTokens(Math.round((result.tokenUsage.input + result.tokenUsage.output) / (result.totalProjectTime / 8)))}</td>
                </tr>
                ` : ''}
              </tbody>
            </table>
          ` : ''}

          ${result.traditionalTime !== undefined && result.agenticTime !== undefined ? `
          <h3>Time Analysis</h3>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Traditional Time</td>
                <td class="time-cell">${formatTimeRounded(result.traditionalTime)}</td>
              </tr>
              <tr>
                <td>Agentic Time</td>
                <td class="time-cell">${formatTimeRounded(result.agenticTime)}</td>
              </tr>
              ${result.savingsAnalysis ? `
              <tr>
                <td>Time Saved</td>
                <td class="time-cell">${formatTimeRounded(result.savingsAnalysis.timeInHours)}</td>
              </tr>
              ` : ''}
            </tbody>
          </table>
        ` : ''}

          ${result.fteEquivalentCost && result.agenticCost ? `
            <h3>FTE Cost Comparison</h3>
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>AI Inference as % of FTE</td>
                  <td class="percentage-cell">${formatPercentage((result.agenticCost.inference.aud) / (result.fteEquivalentCost.aud * 12) * 100)}</td>
                </tr>
                <tr>
                  <td>Annual FTE Cost</td>
                  <td class="currency-cell">${formatCurrency(result.fteEquivalentCost.aud * 12, 'AUD')}</td>
                </tr>
                <tr>
                  <td>Annual AI Inference Cost</td>
                  <td class="currency-cell">
                    <div class="dual-currency">
                      <div>${formatCurrency(result.agenticCost.inference.aud, 'AUD')}</div>
                      <div class="secondary-currency">${formatCurrency(result.agenticCost.inference.usd, 'USD')}</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          ` : ''}
        </div>

        ${(chartImages.costComparison || chartImages.timeAnalysis) ? `
          <div class="page-break"></div>
          <div class="section" style="margin-top: 40px;">
            <h2 style="text-align: center; margin-bottom: 30px;">Analysis Charts</h2>
            <div style="display: flex; justify-content: center; gap: 40px; margin: 20px 0; page-break-inside: avoid;">
              ${chartImages.costComparison ? `
                <div style="flex: 1; max-width: 48%;">
                  <h3 style="text-align: center;">Estimated Cost Analysis</h3>
                  <div style="width: 100%; min-height: 300px; text-align: center;">
                    <img src="${chartImages.costComparison}" alt="Cost Comparison Chart" style="width: 100%; height: 300px; object-fit: contain;" />
                  </div>
                </div>
              ` : ''}
              ${chartImages.timeAnalysis ? `
                <div style="flex: 1; max-width: 48%;">
                  <h3 style="text-align: center;">Estimated Time Analysis</h3>
                  <div style="width: 100%; min-height: 300px; text-align: center;">
                    <img src="${chartImages.timeAnalysis}" alt="Time Analysis Chart" style="width: 100%; height: 300px; object-fit: contain;" />
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        ${chartImages.costOverTime ? `
          <div class="page-break"></div>
          <div class="section">
            <h2>Project Cost Over Time</h2>
            <p style="margin-bottom: 15px;">Comparison of traditional vs agentic development costs over time</p>
            <div class="text-center">
              <img src="${chartImages.costOverTime}" alt="Cost Over Time Chart" style="max-width: 100%; height: auto; margin: 20px 0;" />
            </div>
          </div>
        ` : ''}

        ${result.calculations && result.calculations.length > 0 && !(formState.projectType === 'ongoing' && result.calculations.length <= 2 && result.calculations.every(calc => calc.includes('Daily'))) ? `
        <div class="page-break"></div>
          <div class="section">
            <h2>Calculation Steps</h2>
            ${formState.projectType === 'both' ? `
              <div class="section">
                <h3>Project Implementation Calculations</h3>
                <ol>
                  ${result.calculations
                    .filter(calc => !calc.includes('Daily') && !calc.includes('Monthly'))
                    .map(calc => `<li>${calc}</li>`)
                    .join('')}
                </ol>

                <h3>Ongoing Operational Calculations</h3>
                <ol>
                  ${result.calculations
                    .filter(calc => calc.includes('Daily') || calc.includes('Monthly'))
                    .map(calc => `<li>${calc}</li>`)
                    .join('')}
                </ol>
              </div>
            ` : `
              <ol>
                ${result.calculations.map(calc => `<li>${calc}</li>`).join('')}
              </ol>
            `}
          </div>
        ` : ''}



        <div class="page-break"></div>
        <div class="section">
          <h2>Calculation Data</h2>
          <pre style="font-size: 10px; overflow: auto; max-height: 4000px;">${JSON.stringify({ formState, result }, null, 2)}</pre>
        </div>

        <script>
          window.onload = function() {
            // Set filename for print dialog
            const date = new Date().toISOString().split('T')[0]
            const filename = \`agentic-cost-analysis${result.customerName ? '-' + '${result.customerName}'.toLowerCase().replace(/[^a-z0-9]/g, '-') : ''}-\${date}\`
            document.title = filename
            window.print()
          }
        </script>
      </body>
      </html>
    `

    reportWindow.document.write(html)
    reportWindow.document.close()
  }

  const exportJSON = () => {
    const data = {
      formState,
      result,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    }

    // Create filename
    const date = new Date().toISOString().split('T')[0]
    const filename = result.customerName
      ? `agentic-cost-analysis-${result.customerName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${date}.json`
      : `agentic-cost-analysis-${date}.json`

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExport = () => {
    if (type === 'pdf') {
      generatePDF()
    } else {
      exportJSON()
    }
  }

  return (
    <button
      onClick={handleExport}
      className={`
        px-4 py-2 rounded-md text-sm font-medium
        ${type === 'pdf'
          ? 'bg-purple-600 text-white hover:bg-purple-700'
          : 'bg-blue-600 text-white hover:bg-blue-700'
        }
        transition-colors
      `}
    >
      Export {type.toUpperCase()}
    </button>
  )
}
