import React from 'react'
import { CalculationResult } from '@/shared/types/models'
import { formatTimeRounded, formatPercentage, formatTokens } from '@/shared/utils/formatting'
import { formatCurrency } from '../inputs/NumericInput'
import { ChartDisplay, ChartDisplayRef } from './ChartDisplay'
import { CostOverTimeChart, CostChartRef } from './CostOverTimeChart'

interface ProjectResultsProps {
  result: CalculationResult
  costComparisonChartRef: React.RefObject<ChartDisplayRef>
  timeAnalysisChartRef: React.RefObject<ChartDisplayRef>
  costOverTimeChartRef: React.RefObject<CostChartRef>
}

export const ProjectResults: React.FC<ProjectResultsProps> = ({
  result,
  costComparisonChartRef,
  timeAnalysisChartRef,
  costOverTimeChartRef
}) => {
  if (!result.traditionalCost || !result.agenticCost) return null

  return (
    <div className="mb-8">
      {/* Project Phase Header */}
      <div className="bg-purple-50/50 border border-purple-200 rounded-lg p-4 mb-6">
        <h4 className="text-lg font-semibold text-purple-700 mb-2 flex items-center">
          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
          Project Implementation Results
        </h4>
      </div>

      {/* Summary Cards - Project Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        {result.fteEquivalentCost && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 shadow-sm">
            <div className="text-m text-purple-700 font-medium mb-1">Project Inference Cost (AI)</div>
            <div className="text-2xl font-bold text-purple-900">
              {formatCurrency(result.agenticCost.inference.aud, 'AUD')}
              <span className="text-sm text-purple-600 ml-1">AUD</span>
            </div>
            <div className="text-sm font-medium text-600 mt-1">
              <div className="text-xs text-purple-500">
                ({formatCurrency(result.agenticCost.inference.usd, 'USD')} USD)
              </div>
              Equivalent of {formatPercentage((result.agenticCost.inference.aud) / (result.fteEquivalentCost.aud * 12) * 100)} of a FTE
            </div>
          </div>
        )}


        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 shadow-sm">
          <div className="text-m text-blue-700 font-medium mb-1">Project Cost (Human+AI)</div>
          <div>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(result.agenticCost.total.aud, 'AUD')}
              <span className="text-sm text-blue-600 ml-1">AUD</span>
            </div>
            <div className="text-sm font-semibold text-red-700 mt-1">
              vs {formatCurrency(result.traditionalCost.aud, 'AUD')} without AI
              <div className="text-xs text-gray-500">
                ({formatCurrency(result.traditionalCost.usd, 'USD')} USD)
              </div>
            </div>
          </div>
        </div>


        <div className="bg-gradient-to-br  from-blue-50 to-blue-100 p-4 rounded-lg border border-indigo-200 shadow-sm">
          <div className="text-m text-blue-700 font-medium mb-1">Project ROI</div>
          <div className="text-2xl font-bold text-blue-900">
            {formatPercentage(result.savingsAnalysis?.roi ?? 0)}
          </div>
          <div className="text-sm font-medium text-blue-600 mt-1">
            ROI on agentic investment
          </div>
        </div>


        {result.traditionalTime !== undefined && result.agenticTime !== undefined && (
          <>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 shadow-sm">
              <div className="text-m text-green-700 font-medium mb-1">Project Time</div>
              <div>
                <div className="text-2xl font-bold text-green-900">
                  {formatTimeRounded(result.agenticTime)}
                </div>
                <div className="text-sm font-semibold text-red-700 mt-1">
                  vs {formatTimeRounded(result.traditionalTime)}
                </div>
              </div>
            </div>

            {result.savingsAnalysis && (
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200 shadow-sm">
                <div className="text-m text-emerald-700 font-medium mb-1">Project Time Saved</div>
                <div className="text-2xl font-bold text-emerald-900">
                  {formatTimeRounded(result.savingsAnalysis.timeInHours)}
                </div>
                <div className="text-sm font-medium text-emerald-600 mt-1">
                  Faster development
                </div>
              </div>
            )}

            {result.savingsAnalysis && (
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200 shadow-sm">
                <div className="text-m text-teal-700 font-medium mb-1">AI Cost Reduction</div>
                <div className="text-2xl font-bold text-teal-900">
                  {formatPercentage(result.savingsAnalysis.percentage)}
                </div>
                <div className="text-sm font-medium text-teal-600 mt-1">
                  Reduction in costs
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cost and Time Visualizations */}
      <div className="flex gap-4 mb-7">
        {/* Cost Visualization */}
        {result.traditionalCost && result.agenticCost && (
          <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Cost Comparison</h3>
            <ChartDisplay
              ref={costComparisonChartRef}
              data={[
                {
                  name: 'Traditional',
                  value: result.traditionalCost.aud,
                  errorMargin: result.traditionalCost.aud * 0.1
                },
                {
                  name: 'Agentic',
                  value: result.agenticCost.total.aud,
                  errorMargin: result.agenticCost.total.aud * 0.1
                },
              ]}
              type="cost"
            />
          </div>
        )}

        {/* Time Visualization */}
        {result.traditionalTime !== undefined && result.totalProjectTime !== undefined && (
          <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Project Time Analysis</h3>
            <ChartDisplay
              ref={timeAnalysisChartRef}
              data={[
                {
                  name: 'Traditional',
                  value: result.traditionalTime,
                  errorMargin: result.traditionalTime * 0.1
                },
                {
                  name: 'Total Agentic Project',
                  value: result.totalProjectTime,
                  errorMargin: result.totalProjectTime * 0.1
                },
                ...(result.agenticTime !== undefined ? [{
                  name: 'Agentic Development',
                  value: result.agenticTime,
                  errorMargin: result.agenticTime * 0.1
                }] : []),
                ...(result.humanGuidanceTime !== undefined ? [{
                  name: 'Human Guidance',
                  value: result.humanGuidanceTime,
                  errorMargin: result.humanGuidanceTime * 0.1
                }] : []),
                ...(result.aiProcessingTime !== undefined ? [{
                  name: 'AI Processing',
                  value: result.aiProcessingTime,
                  errorMargin: result.aiProcessingTime * 0.1
                }] : []),
                ...(result.projectAiSetupTime !== undefined ? [{
                  name: 'Project AI Setup',
                  value: result.projectAiSetupTime,
                  errorMargin: result.projectAiSetupTime * 0.1
                }] : [])
              ]}
              type="time"
            />
          </div>
        )}
      </div>

      {/* Project Cost Over Time Chart */}
      {result.traditionalTime !== undefined && result.agenticTime !== undefined && (
        <div className="mb-8 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Project Cost Over Time</h3>
          <CostOverTimeChart
            ref={costOverTimeChartRef}
            traditionalTime={result.traditionalTime}
            traditionalCost={result.traditionalCost.aud}
            agenticTime={result.agenticTime}
            agenticCost={result.agenticCost.total.aud}
            errorMargin={10}
          />
        </div>
      )}

      {/* Token Usage */}
      {result.tokenUsage && (
        <div className="mt-4 bg-indigo-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-indigo-700 mb-2">Project Token Usage</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-indigo-500">Input Tokens</div>
              <div className="text-sm font-mono font-medium text-indigo-900">{formatTokens(result.tokenUsage.input)}</div>
            </div>
            <div>
              <div className="text-xs text-indigo-500">Output Tokens</div>
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
  )
}
