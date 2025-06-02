import React from 'react';
import { CalculationResult } from '@/shared/types/models';
import { formatPercentage, formatTokens } from '@/shared/utils/formatting';
import { formatCurrency } from '../inputs/NumericInput';
import { ChartDisplay, ChartDisplayRef } from './ChartDisplay';
import { CostOverTimeChart, CostChartRef } from './CostOverTimeChart';

interface OngoingResultsProps {
  result: CalculationResult;
  costComparisonChartRef: React.RefObject<ChartDisplayRef>;
  costOverTimeChartRef: React.RefObject<CostChartRef>;
}

export const OngoingResults: React.FC<OngoingResultsProps> = ({
  result,
  costComparisonChartRef,
  costOverTimeChartRef
}) => {
  if (!result.dailyCosts) return null;

  return (
    <div className="mb-8">
      {/* Ongoing Phase Header */}
      <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="text-lg font-semibold text-blue-700 mb-2 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Ongoing Run Cost Results
        </h4>
      </div>

      {/* Summary Cards - Ongoing Metrics */}
      {/* Cost Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Daily Costs */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 shadow-sm">
          <div className="text-m text-blue-700 font-medium mb-1">Daily Cost</div>
          <div className="text-2xl font-bold text-blue-900">
            A{formatCurrency(result.dailyCosts.total.aud, 'AUD')}
          </div>
          <div className="text-sm text-blue-600">
            {formatCurrency(result.dailyCosts.total.usd, 'USD')} USD per day
          </div>
        </div>

        {/* Monthly Costs */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 shadow-sm">
          <div className="text-m text-blue-700 font-medium mb-1">Monthly Cost</div>
          <div className="text-2xl font-bold text-blue-900">
            A{formatCurrency(result.dailyCosts.monthly?.aud ?? 0, 'AUD')}
          </div>
          <div className="text-sm text-blue-600">
            {formatCurrency(result.dailyCosts.monthly?.usd ?? 0, 'USD')} USD per month
          </div>
        </div>

        {/* Annual Costs */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 shadow-sm">
          <div className="text-m text-blue-700 font-medium mb-1">Annual Cost</div>
          <div className="text-2xl font-bold text-blue-900">
            A{formatCurrency(result.dailyCosts.yearly?.aud ?? 0, 'AUD')}
          </div>
          <div className="text-sm text-blue-600">
            {formatCurrency(result.dailyCosts.yearly?.usd ?? 0, 'USD')} USD per year
          </div>
        </div>

        {result.dailyCosts.roiAnalysis && (
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200 shadow-sm">
            <div className="text-m text-indigo-700 font-medium mb-1">ROI Analysis</div>
            <div className="text-2xl font-bold text-indigo-900">
              {formatPercentage(result.dailyCosts.roiAnalysis.roi)}
            </div>
            <div className="text-sm text-indigo-600 mt-1">
              {result.dailyCosts.roiAnalysis.productivityGain}x productivity gain
            </div>
            <div className="mt-2 text-sm">
              <div className="text-emerald-600">
                Monthly savings: A{formatCurrency((result.dailyCosts.roiAnalysis.traditionalCost?.aud ?? 0) * 20 - (result.dailyCosts.monthly?.aud ?? 0), 'AUD')}
              </div>
              <div className="text-emerald-600">
                Annual savings: A{formatCurrency((result.dailyCosts.roiAnalysis.traditionalCost?.aud ?? 0) * 240 - (result.dailyCosts.yearly?.aud ?? 0), 'AUD')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Per Developer Costs */}
      {result.dailyCosts.perDev && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200 shadow-sm">
            <div className="text-m text-teal-700 font-medium mb-1">Daily Cost per Dev</div>
            <div className="text-2xl font-bold text-teal-900">
              A{formatCurrency(result.dailyCosts.perDev.aud, 'AUD')}
            </div>
            <div className="text-sm text-teal-600">
              {formatCurrency(result.dailyCosts.perDev.usd, 'USD')} USD per day
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200 shadow-sm">
            <div className="text-m text-teal-700 font-medium mb-1">Monthly Cost per Dev</div>
            <div className="text-2xl font-bold text-teal-900">
              A{formatCurrency(result.dailyCosts.perDevMonthly?.aud ?? 0, 'AUD')}
            </div>
            <div className="text-sm text-teal-600">
              {formatCurrency(result.dailyCosts.perDevMonthly?.usd ?? 0, 'USD')} USD per month
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200 shadow-sm">
            <div className="text-m text-teal-700 font-medium mb-1">Annual Cost per Dev</div>
            <div className="text-2xl font-bold text-teal-900">
              A{formatCurrency(result.dailyCosts.perDevYearly?.aud ?? 0, 'AUD')}
            </div>
            <div className="text-sm text-teal-600">
              {formatCurrency(result.dailyCosts.perDevYearly?.usd ?? 0, 'USD')} USD per year
            </div>
          </div>
        </div>
      )}

      {/* Cost Breakdown by Source */}
      {result.dailyCosts.breakdown && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Breakdown by Source</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team/Developer Costs */}
            {result.dailyCosts.breakdown.team && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 shadow-sm">
                <h4 className="text-lg font-semibold text-purple-700 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                  Team/Developer Usage
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-600">Daily:</span>
                    <span className="font-bold text-purple-900">A{formatCurrency(result.dailyCosts.breakdown.team.total.aud, 'AUD')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-600">Monthly:</span>
                    <span className="font-bold text-purple-900">A{formatCurrency(result.dailyCosts.breakdown.team.monthly.aud, 'AUD')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-600">Annual:</span>
                    <span className="font-bold text-purple-900">A{formatCurrency(result.dailyCosts.breakdown.team.yearly.aud, 'AUD')}</span>
                  </div>
                  {result.dailyCosts.breakdown.team.perDev && (
                    <div className="mt-4 pt-3 border-t border-purple-300">
                      <div className="text-sm text-purple-600 mb-2">Per Developer:</div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-purple-600">Daily:</span>
                        <span className="font-medium text-purple-800">A{formatCurrency(result.dailyCosts.breakdown.team.perDev.aud, 'AUD')}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-purple-600">Monthly:</span>
                        <span className="font-medium text-purple-800">A{formatCurrency(result.dailyCosts.breakdown.team.perDevMonthly?.aud ?? 0, 'AUD')}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-purple-600">Annual:</span>
                        <span className="font-medium text-purple-800">A{formatCurrency(result.dailyCosts.breakdown.team.perDevYearly?.aud ?? 0, 'AUD')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Product/Application Costs */}
            {result.dailyCosts.breakdown.product && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 shadow-sm">
                <h4 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Product/Application Usage
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">Daily:</span>
                    <span className="font-bold text-green-900">A{formatCurrency(result.dailyCosts.breakdown.product.total.aud, 'AUD')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">Monthly:</span>
                    <span className="font-bold text-green-900">A{formatCurrency(result.dailyCosts.breakdown.product.monthly.aud, 'AUD')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">Annual:</span>
                    <span className="font-bold text-green-900">A{formatCurrency(result.dailyCosts.breakdown.product.yearly.aud, 'AUD')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="flex gap-4 mb-7">
        {result.dailyCosts.roiAnalysis && (
          <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ongoing Cost Efficiency</h3>
            <ChartDisplay
              ref={costComparisonChartRef}
              data={[
                {
                  name: 'Traditional Monthly',
                  value: (result.dailyCosts.roiAnalysis?.traditionalCost?.aud ?? 0) * 20,
                  errorMargin: (result.dailyCosts.roiAnalysis?.traditionalCost?.aud ?? 0) * 20 * 0.1
                },
                {
                  name: 'Agentic Monthly',
                  value: result.dailyCosts?.monthly?.aud ?? 0,
                  errorMargin: (result.dailyCosts?.monthly?.aud ?? 0) * 0.1
                }
              ]}
              type="cost"
            />
          </div>
        )}
      </div>

      {/* Agentic Spend Over Time */}
      {result.dailyCosts && (
        <div className="mb-8 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Agentic Spend Over Time</h3>
          <CostOverTimeChart
            ref={costOverTimeChartRef}
            agenticTime={12} // Show full year in months
            agenticCost={result.dailyCosts.total.aud * 20} // Use monthly cost calculation for annual projection
            errorMargin={10}
            isOngoing={true}
          />
        </div>
      )}

      {/* Ongoing Token Usage */}
      {result.tokenUsage && (
        <div className="mt-4 bg-indigo-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-indigo-700 mb-2">Ongoing Token Usage</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-indigo-500">Daily Input Tokens</div>
              <div className="text-sm font-mono font-medium text-indigo-900">{formatTokens(result.tokenUsage.input)}</div>
            </div>
            <div>
              <div className="text-xs text-indigo-500">Daily Output Tokens</div>
              <div className="text-sm font-mono font-medium text-indigo-900">{formatTokens(result.tokenUsage.output)}</div>
            </div>
            <div>
              <div className="text-xs text-indigo-500">Cache Write</div>
              <div className="text-sm font-mono font-medium text-indigo-900">{formatTokens(result.tokenUsage.cacheWrite)}</div>
            </div>
            <div>
              <div className="text-xs text-indigo-500">Cache Read</div>
              <div className="text-sm font-mono font-medium text-indigo-900">{formatTokens(result.tokenUsage.cacheRead)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
