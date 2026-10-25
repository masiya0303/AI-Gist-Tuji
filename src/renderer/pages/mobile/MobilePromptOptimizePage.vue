<!--
  Fork addition (AGPL v3.0 Section 5a):
  Added by 兔叽 (msiya8160-star) on 2026-10-25
  Purpose: Mobile AI prompt optimization workbench, opened from prompt detail.
  Inspired by the prompt-optimizer project's optimization / compare / evaluation
  flow, implemented against AI Gist's existing mobile AI config and prompt model.
  Extended on 2026-10-25 with execution-based evaluation (shared test inputs,
  original vs optimized output snapshots, evidence-grounded comparison),
  inspired by prompt-optimizer's test-case / snapshot / compare evaluation design.
  Original project: AI Gist by Yarin Zhang (https://github.com/yarin-zhang/AI-Gist)
  This fork is licensed under AGPL-3.0
-->
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/prompts"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ t('promptOptimization.title') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button
            v-if="activeResult"
            :aria-label="t('promptOptimization.copyResult')"
            @click="copyResult"
          >
            <ion-icon :icon="copyOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="loading" class="loading-container">
        <ion-spinner></ion-spinner>
      </div>

      <div v-else-if="loadError || !prompt" class="empty-container">
        <ion-icon :icon="documentTextOutline" class="empty-icon"></ion-icon>
        <p class="empty-text">{{ loadError || t('promptOptimization.promptNotFound') }}</p>
        <ion-button fill="outline" @click="router.back()">{{ t('common.back') }}</ion-button>
      </div>

      <div v-else class="optimize-flow">
        <!-- 原始提示词 -->
        <section class="optimize-card">
          <div class="card-heading">
            <div class="card-heading-copy">
              <h2>{{ t('promptOptimization.originalPrompt') }}</h2>
              <p v-if="prompt.title" class="card-subtitle">{{ prompt.title }}</p>
            </div>
            <button type="button" class="text-action" @click="originalExpanded = !originalExpanded">
              {{ originalExpanded ? t('promptOptimization.collapse') : t('promptOptimization.expand') }}
              <ion-icon :icon="originalExpanded ? chevronUpOutline : chevronDownOutline"></ion-icon>
            </button>
          </div>

          <pre class="original-content" :class="{ 'is-expanded': originalExpanded }">{{ prompt.content }}</pre>

          <div class="meta-row">
            <span>{{ t('promptOptimization.charCount', { count: originalCharCount }) }}</span>
            <template v-if="originalVariables.length">
              <span>{{ t('promptOptimization.variables') }}</span>
              <code v-for="variable in originalVariables" :key="variable" class="variable-chip">{{ variable }}</code>
            </template>
            <span v-else>{{ t('promptOptimization.noVariables') }}</span>
          </div>
        </section>

        <div v-if="configs.length === 0" class="empty-container compact">
          <EmptyAIConfigIllustration />
          <p class="empty-text">{{ t('promptOptimization.noConfig') }}</p>
          <p class="empty-description">{{ t('promptOptimization.noConfigDescription') }}</p>
          <ion-button @click="openAIConfig">{{ t('promptOptimization.addConfig') }}</ion-button>
        </div>

        <template v-else>
          <!-- 优化设置 -->
          <section class="optimize-card">
            <h2 class="section-heading">{{ t('promptOptimization.settings') }}</h2>

            <div class="field-block">
              <span class="field-label">{{ t('promptOptimization.target') }}</span>
              <ion-segment v-model="target" class="target-segment">
                <ion-segment-button value="user">
                  <ion-label>{{ t('promptOptimization.targetUser') }}</ion-label>
                </ion-segment-button>
                <ion-segment-button value="system">
                  <ion-label>{{ t('promptOptimization.targetSystem') }}</ion-label>
                </ion-segment-button>
              </ion-segment>
              <p class="field-hint">
                {{ target === 'user'
                  ? t('promptOptimization.targetUserHint')
                  : t('promptOptimization.targetSystemHint') }}
              </p>
            </div>

            <div class="field-block">
              <span class="field-label">{{ t('promptOptimization.direction') }}</span>
              <div class="preset-grid">
                <button
                  v-for="preset in OPTIMIZATION_PRESETS"
                  :key="preset.id"
                  type="button"
                  class="preset-option"
                  :class="{ active: presetId === preset.id }"
                  @click="presetId = preset.id"
                >
                  <span class="preset-name">{{ t(preset.nameKey) }}</span>
                  <span class="preset-description">{{ t(preset.descriptionKey) }}</span>
                </button>
              </div>
            </div>

            <div v-if="presetId === 'custom'" class="field-block">
              <ion-textarea
                v-model="customInstruction"
                class="prompt-textarea"
                :label="t('promptOptimization.customDirection')"
                label-placement="stacked"
                :placeholder="t('promptOptimization.customDirectionPlaceholder')"
                :rows="4"
                :auto-grow="true"
              ></ion-textarea>
            </div>

            <div class="field-block">
              <span class="field-label">{{ t('promptOptimization.model') }}</span>
              <button
                type="button"
                class="model-row"
                :disabled="configs.length === 0"
                @click="showModelPicker = true"
              >
                <span class="model-row-name">{{ selectedModelName || t('promptOptimization.selectModel') }}</span>
                <ion-icon :icon="chevronForward"></ion-icon>
              </button>
              <p v-if="configs.length > 0 && !selectedModelKey" class="field-hint warning-text">
                {{ t('promptOptimization.noModel') }}
              </p>
            </div>

            <ion-button
              expand="block"
              class="primary-action"
              :disabled="!canOptimize"
              @click="runOptimization"
            >
              <ion-spinner v-if="optimizing" name="crescent" slot="start"></ion-spinner>
              <ion-icon v-else :icon="sparklesOutline" slot="start"></ion-icon>
              {{ optimizing ? t('promptOptimization.optimizing') : t('promptOptimization.startOptimize') }}
            </ion-button>

            <ion-button
              v-if="optimizing"
              expand="block"
              fill="clear"
              color="danger"
              @click="stopOptimization"
            >
              <ion-icon :icon="stopCircleOutline" slot="start"></ion-icon>
              {{ t('promptOptimization.stop') }}
            </ion-button>
          </section>

          <!-- 优化结果 / 对比 / 评估 -->
          <section v-if="rounds.length > 0" class="optimize-card">
            <div class="card-heading result-heading">
              <h2>{{ t('promptOptimization.result') }}</h2>
              <div class="round-tabs">
                <button
                  v-for="(round, index) in rounds"
                  :key="round.id"
                  type="button"
                  class="round-tab"
                  :class="{ active: activeRoundIndex === index }"
                  @click="selectRound(index)"
                >
                  {{ t('promptOptimization.round', { index: index + 1 }) }}
                </button>
              </div>
            </div>

            <ion-segment v-model="activeTab" class="result-segment">
              <ion-segment-button value="result">
                <ion-label>{{ t('promptOptimization.result') }}</ion-label>
              </ion-segment-button>
              <ion-segment-button value="compare">
                <ion-label>{{ t('promptOptimization.compare') }}</ion-label>
              </ion-segment-button>
              <ion-segment-button value="evaluation">
                <ion-label>{{ t('promptOptimization.evaluation') }}</ion-label>
              </ion-segment-button>
            </ion-segment>

            <div v-if="activeTab === 'result'" class="tab-panel">
              <ion-textarea
                v-model="activeResult"
                class="result-textarea"
                :placeholder="t('promptOptimization.resultPlaceholder')"
                :readonly="optimizing"
                :rows="10"
                :auto-grow="true"
              ></ion-textarea>

              <div class="meta-row">
                <span>{{ t('promptOptimization.charCount', { count: resultCharCount }) }}</span>
                <span v-if="activeRound?.stopped" class="warning-text">{{ t('promptOptimization.stopped') }}</span>
                <span v-if="missingVariables.length" class="warning-text">
                  {{ t('promptOptimization.missingVariables', { variables: missingVariables.join(', ') }) }}
                </span>
                <span v-else-if="originalVariables.length" class="success-text">
                  {{ t('promptOptimization.variablesPreserved') }}
                </span>
              </div>

              <div class="inline-actions">
                <ion-button fill="outline" size="small" @click="copyResult">
                  <ion-icon :icon="copyOutline" slot="start"></ion-icon>
                  {{ t('promptOptimization.copyResult') }}
                </ion-button>
                <ion-button
                  fill="clear"
                  size="small"
                  :disabled="evaluating || !activeResult"
                  @click="runEvaluation"
                >
                  <ion-icon :icon="analyticsOutline" slot="start"></ion-icon>
                  {{ evaluating ? t('promptOptimization.evaluating') : t('promptOptimization.evaluate') }}
                </ion-button>
              </div>
            </div>

            <div v-else-if="activeTab === 'compare'" class="tab-panel">
              <div class="compare-stats">
                <span>{{ t('promptOptimization.original') }} · {{ originalCharCount }}</span>
                <span>{{ t('promptOptimization.optimized') }} · {{ resultCharCount }}</span>
                <span v-if="diffStats.added" class="diff-stat-added">+{{ diffStats.added }}</span>
                <span v-if="diffStats.removed" class="diff-stat-removed">-{{ diffStats.removed }}</span>
              </div>
              <div class="diff-view">
                <div
                  v-for="(row, index) in diffRows"
                  :key="index"
                  class="diff-row"
                  :class="row.type"
                >
                  <span class="diff-sign">{{ row.type === 'added' ? '+' : row.type === 'removed' ? '-' : ' ' }}</span>
                  <span class="diff-text"><template v-if="row.segments"><span
                    v-for="(segment, segmentIndex) in row.segments"
                    :key="segmentIndex"
                    class="diff-word"
                    :class="segment.type"
                  >{{ segment.text }}</span></template><template v-else>{{ row.text || ' ' }}</template></span>
                </div>
              </div>
            </div>

            <div v-else class="tab-panel">
              <ion-segment v-model="evaluationMode" class="eval-mode-segment">
                <ion-segment-button value="quick">
                  <ion-label>{{ t('promptOptimization.evalModeQuick') }}</ion-label>
                </ion-segment-button>
                <ion-segment-button value="execution">
                  <ion-label>{{ t('promptOptimization.evalModeExecution') }}</ion-label>
                </ion-segment-button>
              </ion-segment>
              <p class="field-hint">
                {{ evaluationMode === 'quick'
                  ? t('promptOptimization.evalModeQuickHint')
                  : t('promptOptimization.evalModeExecutionHint') }}
              </p>

              <div v-if="displayEvaluation" class="evaluation-result">
                <div class="score-row">
                  <div class="score-block">
                    <span class="score-value">{{ displayEvaluation.originalScore }}</span>
                    <span class="score-label">{{ t('promptOptimization.original') }}</span>
                  </div>
                  <ion-icon :icon="arrowForward" class="score-arrow"></ion-icon>
                  <div class="score-block optimized">
                    <span class="score-value">{{ displayEvaluation.optimizedScore }}</span>
                    <span class="score-label">{{ t('promptOptimization.optimized') }}</span>
                  </div>
                  <ion-chip :color="verdictColor" size="small">{{ verdictLabel }}</ion-chip>
                </div>

                <div class="dimension-list">
                  <div v-for="dimension in displayEvaluation.dimensions" :key="dimension.key" class="dimension">
                    <div class="dimension-header">
                      <span>{{ getDimensionLabel(dimension) }}</span>
                      <span>{{ dimension.originalScore }} → {{ dimension.optimizedScore }}</span>
                    </div>
                    <div class="dimension-bars">
                      <span class="dimension-bar original" :style="{ width: `${dimension.originalScore}%` }"></span>
                      <span class="dimension-bar optimized" :style="{ width: `${dimension.optimizedScore}%` }"></span>
                    </div>
                  </div>
                </div>

                <div
                  v-if="evaluationMode === 'execution' && executionEvaluation?.testCaseFindings.length"
                  class="finding-list"
                >
                  <h3>{{ t('promptOptimization.findingsTitle') }}</h3>
                  <div
                    v-for="finding in executionEvaluation.testCaseFindings"
                    :key="finding.testCaseId"
                    class="finding-item"
                  >
                    <div class="finding-header">
                      <span class="finding-case">{{ testCaseDisplayName(finding.testCaseId) }}</span>
                      <ion-chip :color="verdictColorFor(finding.verdict)" size="small">
                        {{ verdictLabelFor(finding.verdict) }}
                      </ion-chip>
                    </div>
                    <p v-if="finding.finding" class="finding-text">{{ finding.finding }}</p>
                  </div>
                </div>

                <p v-if="displayEvaluation.summary" class="evaluation-summary">{{ displayEvaluation.summary }}</p>

                <div v-if="displayEvaluation.improvements.length" class="improvement-list">
                  <h3>{{ t('promptOptimization.improvements') }}</h3>
                  <ul>
                    <li v-for="(improvement, index) in displayEvaluation.improvements" :key="index">{{ improvement }}</li>
                  </ul>
                </div>
              </div>

              <div v-else-if="evaluationMode === 'quick' && evaluationError" class="evaluation-error">
                <p>{{ evaluationError }}</p>
                <pre v-if="activeRound?.evaluationRaw" class="evaluation-raw">{{ activeRound.evaluationRaw }}</pre>
              </div>

              <div v-else-if="evaluationMode === 'execution' && executionError" class="evaluation-error">
                <p>{{ executionError }}</p>
                <pre v-if="activeRound?.execution?.raw" class="evaluation-raw">{{ activeRound.execution.raw }}</pre>
              </div>

              <p v-else class="evaluation-hint">
                {{ evaluationMode === 'quick'
                  ? t('promptOptimization.evaluationHint')
                  : t('promptOptimization.executionHint') }}
              </p>

              <!-- 快速评估 -->
              <ion-button
                v-if="evaluationMode === 'quick'"
                expand="block"
                fill="outline"
                :disabled="evaluating || !activeResult"
                @click="runEvaluation"
              >
                <ion-spinner v-if="evaluating" name="crescent" slot="start"></ion-spinner>
                <ion-icon v-else :icon="analyticsOutline" slot="start"></ion-icon>
                {{ evaluating ? t('promptOptimization.evaluating') : t('promptOptimization.evaluate') }}
              </ion-button>

              <!-- 执行评估 -->
              <template v-else>
                <div class="field-block">
                  <div class="field-label-row">
                    <span class="field-label">{{ t('promptOptimization.testCasesTitle') }}</span>
                    <button
                      type="button"
                      class="text-action"
                      :disabled="generatingInputs || executing || comparing"
                      @click="generateTestInputs"
                    >
                      <ion-spinner v-if="generatingInputs" name="crescent"></ion-spinner>
                      <ion-icon v-else :icon="sparklesOutline"></ion-icon>
                      {{ t('promptOptimization.generateTestInputs') }}
                    </button>
                  </div>
                  <p class="field-hint">{{ t('promptOptimization.testCasesHint', { count: testCases.length }) }}</p>

                  <div
                    v-for="(testCase, index) in testCases"
                    :key="testCase.id"
                    class="test-case-card"
                  >
                    <div class="test-case-header">
                      <span>{{ t('promptOptimization.testCaseLabel', { index: index + 1 }) }}</span>
                      <button
                        v-if="testCases.length > 1"
                        type="button"
                        class="text-action danger"
                        :aria-label="t('promptOptimization.removeTestCase')"
                        @click="removeTestCase(testCase.id)"
                      >
                        <ion-icon :icon="trashOutline"></ion-icon>
                      </button>
                    </div>
                    <div v-if="originalVariables.length" class="case-values">
                      <ion-input
                        v-for="variable in originalVariables"
                        :key="variable"
                        v-model="testCase.values[variable]"
                        class="case-value-input"
                        :label="variable"
                        label-placement="stacked"
                        fill="outline"
                      ></ion-input>
                    </div>
                    <ion-textarea
                      v-if="target === 'system'"
                      v-model="testCase.userMessage"
                      class="prompt-textarea"
                      :placeholder="t('promptOptimization.testCaseUserMessagePlaceholder')"
                      :rows="2"
                      :auto-grow="true"
                    ></ion-textarea>
                  </div>

                  <ion-button
                    v-if="testCases.length < maxExecutionTestCases"
                    fill="outline"
                    size="small"
                    :disabled="executing || comparing"
                    @click="addTestCase"
                  >
                    <ion-icon :icon="addOutline" slot="start"></ion-icon>
                    {{ t('promptOptimization.addTestCase') }}
                  </ion-button>
                </div>

                <div v-if="executionState?.snapshots.length" class="snapshot-list">
                  <h3>{{ t('promptOptimization.snapshotsTitle') }}</h3>
                  <div v-for="testCase in testCases" :key="testCase.id" class="snapshot-group">
                    <button type="button" class="snapshot-header" @click="toggleCaseExpanded(testCase.id)">
                      <span>{{ testCaseDisplayName(testCase.id) }}</span>
                      <ion-icon
                        :icon="isCaseExpanded(testCase.id) ? chevronUpOutline : chevronDownOutline"
                      ></ion-icon>
                    </button>
                    <div v-if="isCaseExpanded(testCase.id)" class="snapshot-body">
                      <div
                        v-for="snapshot in snapshotsForCase(testCase.id)"
                        :key="snapshot.id"
                        class="snapshot-item"
                      >
                        <span class="snapshot-tag" :class="snapshot.promptRef">
                          {{ snapshot.promptRef === 'original'
                            ? t('promptOptimization.executionOriginal')
                            : t('promptOptimization.executionOptimized') }}
                        </span>
                        <pre class="snapshot-output">{{ snapshot.output || t('promptOptimization.testCaseOutputEmpty') }}</pre>
                      </div>
                    </div>
                  </div>
                </div>

                <p v-if="executing" class="execution-progress">{{ executionProgress }}</p>

                <div class="inline-actions">
                  <ion-button
                    fill="outline"
                    size="small"
                    :disabled="!canExecuteTests"
                    @click="runExecutionTests"
                  >
                    <ion-spinner v-if="executing" name="crescent" slot="start"></ion-spinner>
                    <ion-icon v-else :icon="playOutline" slot="start"></ion-icon>
                    {{ executing ? t('promptOptimization.executingTests') : t('promptOptimization.runTests') }}
                  </ion-button>
                  <ion-button
                    v-if="executing"
                    fill="clear"
                    size="small"
                    color="danger"
                    @click="stopExecution"
                  >
                    <ion-icon :icon="stopCircleOutline" slot="start"></ion-icon>
                    {{ t('promptOptimization.stop') }}
                  </ion-button>
                  <ion-button
                    fill="clear"
                    size="small"
                    :disabled="!canRunExecutionCompare"
                    @click="runExecutionCompare"
                  >
                    <ion-spinner v-if="comparing" name="crescent" slot="start"></ion-spinner>
                    <ion-icon v-else :icon="analyticsOutline" slot="start"></ion-icon>
                    {{ comparing ? t('promptOptimization.evaluating') : t('promptOptimization.compareEvaluate') }}
                  </ion-button>
                </div>
                <p class="field-hint">{{ t('promptOptimization.executionCostHint', { calls: estimatedExecutionCalls }) }}</p>
              </template>
            </div>
          </section>

          <!-- 继续优化 -->
          <section v-if="activeRound && !optimizing" class="optimize-card">
            <h2 class="section-heading">{{ t('promptOptimization.iterateTitle') }}</h2>
            <ion-textarea
              v-model="iterationInstruction"
              class="prompt-textarea"
              :placeholder="t('promptOptimization.iteratePlaceholder')"
              :rows="3"
              :auto-grow="true"
            ></ion-textarea>
            <ion-button
              expand="block"
              class="secondary-action"
              :disabled="!canIterate"
              @click="runIteration"
            >
              <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
              {{ t('promptOptimization.iterate') }}
            </ion-button>
          </section>
        </template>
      </div>

      <!-- 底部应用栏 -->
      <div v-if="activeRound && !optimizing" class="optimize-action-bar" slot="fixed">
        <ion-button fill="outline" class="action-bar-button" @click="copyResult">
          <ion-icon :icon="copyOutline" slot="start"></ion-icon>
          {{ t('promptOptimization.copyResult') }}
        </ion-button>
        <ion-button
          class="action-bar-button"
          :disabled="!activeResult || missingVariables.length > 0 || applying"
          @click="applyResult"
        >
          <ion-spinner v-if="applying" name="crescent" slot="start"></ion-spinner>
          <ion-icon v-else :icon="checkmarkCircle" slot="start"></ion-icon>
          {{ applying ? t('promptOptimization.applying') : t('promptOptimization.apply') }}
        </ion-button>
      </div>
    </ion-content>

    <!-- 模型选择 -->
    <ion-modal :is-open="showModelPicker" @didDismiss="showModelPicker = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ t('promptOptimization.selectModel') }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showModelPicker = false">{{ t('common.close') }}</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <template v-for="config in configs" :key="config.configId">
            <ion-list-header v-if="configs.length > 1">
              <ion-label>
                {{ config.name }}
                <ion-icon v-if="config.isPreferred" :icon="star" color="warning" class="preferred-star"></ion-icon>
              </ion-label>
            </ion-list-header>
            <ion-item
              v-for="model in getConfigModels(config)"
              :key="`${config.configId}:${model}`"
              button
              @click="selectModel(config, model)"
            >
              <ion-label>{{ model }}</ion-label>
              <ion-icon
                v-if="selectedModelKey === `${config.configId}:${model}`"
                :icon="checkmark"
                slot="end"
                color="primary"
              ></ion-icon>
            </ion-item>
            <ion-item v-if="getConfigModels(config).length === 0" lines="none">
              <ion-label color="medium">{{ t('promptOptimization.noModelHint') }}</ion-label>
            </ion-item>
          </template>
        </ion-list>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonBackButton,
  IonIcon,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonTextarea,
  IonChip,
  IonInput,
  IonModal,
  IonList,
  IonListHeader,
  IonItem,
  alertController,
  onIonViewWillEnter
} from '@ionic/vue'
import {
  sparklesOutline,
  copyOutline,
  checkmarkCircle,
  stopCircleOutline,
  refreshOutline,
  analyticsOutline,
  chevronForward,
  chevronDownOutline,
  chevronUpOutline,
  documentTextOutline,
  checkmark,
  star,
  arrowForward,
  trashOutline,
  addOutline,
  playOutline
} from 'ionicons/icons'
import { useI18n } from '~/composables/useI18n'
import { api } from '~/lib/api'
import { AIGeneratorService } from '~/lib/services/mobile-ai-generator.service'
import { presentMobileToast } from '~/lib/utils/mobile-toast'
import { parsePromptTemplate } from '~/lib/utils/prompt-template'
import {
  OPTIMIZATION_PRESETS,
  buildEvaluationPrompt,
  buildIterationPrompt,
  buildOptimizationPrompt,
  cleanOptimizationResult,
  getMissingVariableNames,
  isOptimizationSupportedType,
  parseEvaluationResponse,
  type OptimizationEvaluation,
  type OptimizationPresetId,
  type OptimizationTarget
} from '~/lib/prompt-optimization/templates'
import { countDiffRows, diffRowsWithWords } from '~/lib/prompt-optimization/diff'
import {
  MAX_EXECUTION_TEST_CASES,
  buildAITestInputsPrompt,
  buildExecutionEvalPrompt,
  buildExecutionMessages,
  parseAITestInputs,
  parseExecutionEvalResponse,
  type ExecutionEvaluation,
  type ExecutionSnapshot,
  type ExecutionTestCase
} from '~/lib/prompt-optimization/execution-eval'
import type { AIConfig, PromptWithRelations } from '@shared/types'
import EmptyAIConfigIllustration from '~/components/mobile/illustrations/EmptyAIConfigIllustration.vue'

interface OptimizationRound {
  id: number
  result: string
  instruction: string
  presetLabel: string
  createdAt: number
  stopped: boolean
  evaluation: OptimizationEvaluation | null
  evaluationRaw: string
  execution: {
    snapshots: ExecutionSnapshot[]
    evaluation: ExecutionEvaluation | null
    raw: string
  } | null
}

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const prompt = ref<PromptWithRelations | null>(null)
const loading = ref(true)
const loadError = ref('')
const configs = ref<AIConfig[]>([])
const selectedModelKey = ref('')
const showModelPicker = ref(false)

const target = ref<OptimizationTarget>('user')
const presetId = ref<OptimizationPresetId>('general')
const customInstruction = ref('')
const originalExpanded = ref(false)

const optimizing = ref(false)
const stopped = ref(false)
const rounds = ref<OptimizationRound[]>([])
const activeRoundIndex = ref(-1)
const activeTab = ref<'result' | 'compare' | 'evaluation'>('result')
const iterationInstruction = ref('')
const evaluating = ref(false)
const evaluationError = ref('')
const applying = ref(false)

const evaluationMode = ref<'quick' | 'execution'>('quick')
const testCases = ref<ExecutionTestCase[]>([])
const generatingInputs = ref(false)
const executing = ref(false)
const executingStopped = ref(false)
const executionProgress = ref('')
const executionError = ref('')
const comparing = ref(false)
const expandedCaseIds = ref<string[]>([])

let roundSequence = 0

const activeRound = computed<OptimizationRound | null>(() => {
  return rounds.value[activeRoundIndex.value] || null
})

const originalContent = computed(() => prompt.value?.content || '')
const originalCharCount = computed(() => originalContent.value.length)
const originalVariables = computed(() => parsePromptTemplate(originalContent.value).variableNames)

const selectedConfig = computed<AIConfig | null>(() => {
  if (!selectedModelKey.value) return null
  const separator = selectedModelKey.value.indexOf(':')
  const configId = separator === -1 ? selectedModelKey.value : selectedModelKey.value.slice(0, separator)
  return configs.value.find(config => config.configId === configId) || null
})

const selectedModel = computed(() => {
  if (!selectedModelKey.value) return ''
  const separator = selectedModelKey.value.indexOf(':')
  return separator === -1 ? '' : selectedModelKey.value.slice(separator + 1)
})

const selectedModelName = computed(() => {
  if (!selectedConfig.value || !selectedModel.value) return ''
  return configs.value.length > 1
    ? `${selectedConfig.value.name} - ${selectedModel.value}`
    : selectedModel.value
})

const activeResult = computed<string>({
  get: () => activeRound.value?.result || '',
  set: (value: string) => {
    const round = activeRound.value
    if (!round) return
    round.result = value
    round.evaluation = null
    round.evaluationRaw = ''
    // 结果被改动后，之前的执行快照对应的已经是旧文本，整体作废
    round.execution = null
    evaluationError.value = ''
    executionError.value = ''
  }
})

const resultCharCount = computed(() => activeResult.value.length)
const missingVariables = computed(() => getMissingVariableNames(originalContent.value, activeResult.value))
const diffRows = computed(() => diffRowsWithWords(originalContent.value, activeResult.value))
const diffStats = computed(() => countDiffRows(diffRows.value))

const evaluation = computed(() => activeRound.value?.evaluation || null)
const executionState = computed(() => activeRound.value?.execution || null)
const executionEvaluation = computed(() => executionState.value?.evaluation || null)
const displayEvaluation = computed(() => {
  return evaluationMode.value === 'quick' ? evaluation.value : executionEvaluation.value
})

const verdictLabelFor = (verdict: string): string => {
  return verdict === 'better'
    ? t('promptOptimization.verdictBetter')
    : verdict === 'worse'
      ? t('promptOptimization.verdictWorse')
      : t('promptOptimization.verdictSimilar')
}
const verdictColorFor = (verdict: string): string => {
  return verdict === 'better' ? 'success' : verdict === 'worse' ? 'danger' : 'medium'
}
const verdictLabel = computed(() => {
  if (!displayEvaluation.value) return ''
  return verdictLabelFor(displayEvaluation.value.verdict)
})
const verdictColor = computed(() => {
  if (!displayEvaluation.value) return 'medium'
  return verdictColorFor(displayEvaluation.value.verdict)
})

// 模型返回的维度 label 可能是中文；UI 语言不是中文时优先使用本地化文案
const getDimensionLabel = (dimension: { key: string; label: string }): string => {
  const key = `promptOptimization.dimensions.${dimension.key}`
  const translated = t(key)
  return translated === key ? dimension.label : translated
}

const canOptimize = computed(() => {
  return Boolean(
    originalContent.value.trim()
    && selectedConfig.value
    && selectedModel.value
    && !optimizing.value
    && (presetId.value !== 'custom' || customInstruction.value.trim())
  )
})

const canIterate = computed(() => {
  return Boolean(
    activeRound.value
    && activeResult.value.trim()
    && iterationInstruction.value.trim()
    && selectedConfig.value
    && selectedModel.value
    && !optimizing.value
    && !evaluating.value
  )
})

const getConfigModels = (config: AIConfig): string[] => {
  const models = new Set<string>()
  if (config.defaultModel) models.add(config.defaultModel)
  config.models?.forEach(model => models.add(model))
  if (config.customModel) models.add(config.customModel)
  return [...models]
}

const selectDefaultModel = () => {
  const preferred = configs.value.find(config => config.isPreferred) || configs.value[0]
  if (!preferred) return
  const model = getConfigModels(preferred)[0]
  if (model) {
    selectedModelKey.value = `${preferred.configId}:${model}`
  }
}

const isModelKeyAvailable = (modelKey: string): boolean => {
  return configs.value.some(config => {
    return getConfigModels(config).some(model => `${config.configId}:${model}` === modelKey)
  })
}

const loadConfigs = async () => {
  try {
    const result = await api.aiConfigs.getEnabled.query()
    configs.value = result.filter(config => isOptimizationSupportedType(config.type))
    if (!selectedModelKey.value || !isModelKeyAvailable(selectedModelKey.value)) {
      selectDefaultModel()
    }
  } catch (error) {
    console.error('加载 AI 配置失败:', error)
    configs.value = []
  }
}

const loadPage = async () => {
  const promptId = Number(route.params.id)
  if (!Number.isInteger(promptId) || promptId <= 0) {
    loadError.value = t('promptOptimization.promptNotFound')
    loading.value = false
    return
  }

  try {
    const [loadedPrompt] = await Promise.all([
      api.prompts.getById.query(promptId),
      loadConfigs()
    ])
    if (!loadedPrompt) {
      loadError.value = t('promptOptimization.promptNotFound')
      return
    }
    prompt.value = loadedPrompt
    loadStoredTestCases()
    if (testCases.value.length === 0) addTestCase()
  } catch (error) {
    console.error('加载提示词失败:', error)
    loadError.value = t('promptOptimization.loadFailed')
  } finally {
    loading.value = false
  }
}

const selectModel = (config: AIConfig, model: string) => {
  selectedModelKey.value = `${config.configId}:${model}`
  showModelPicker.value = false
}

const openAIConfig = () => {
  router.push('/ai-config/create')
}

const selectRound = (index: number) => {
  activeRoundIndex.value = index
  evaluationError.value = ''
  executionError.value = ''
}

const removeRound = (roundId: number) => {
  const index = rounds.value.findIndex(round => round.id === roundId)
  if (index === -1) return
  rounds.value.splice(index, 1)
  if (rounds.value.length === 0) {
    activeRoundIndex.value = -1
  } else {
    activeRoundIndex.value = Math.min(index, rounds.value.length - 1)
  }
}

const startRound = async (options: {
  systemPrompt: string
  userPrompt: string
  instruction: string
  presetLabel: string
}) => {
  const config = selectedConfig.value
  const model = selectedModel.value
  if (!config || !model) {
    showToast(t('promptOptimization.noModel'), 'warning')
    return
  }

  const round: OptimizationRound = {
    id: ++roundSequence,
    result: '',
    instruction: options.instruction,
    presetLabel: options.presetLabel,
    createdAt: Date.now(),
    stopped: false,
    evaluation: null,
    evaluationRaw: '',
    execution: null
  }
  rounds.value.push(round)
  activeRoundIndex.value = rounds.value.length - 1
  activeTab.value = 'result'
  optimizing.value = true
  stopped.value = false
  evaluationError.value = ''

  try {
    const generated = await AIGeneratorService.generateChat(
      config,
      model,
      options.systemPrompt,
      options.userPrompt,
      content => {
        if (stopped.value) return
        const current = rounds.value.find(item => item.id === round.id)
        if (current) current.result = content
      },
      { temperature: 0.4, maxTokens: 4000 }
    )

    const current = rounds.value.find(item => item.id === round.id)
    if (!current) return

    if (stopped.value) {
      current.stopped = true
      showToast(t('promptOptimization.stopped'), 'warning')
      return
    }

    current.result = cleanOptimizationResult(generated)
    if (!current.result) {
      removeRound(round.id)
      showToast(t('promptOptimization.optimizeFailed'), 'danger')
      return
    }
    showToast(t('promptOptimization.optimizeSuccess'), 'success')
  } catch (error) {
    const current = rounds.value.find(item => item.id === round.id)
    if (current) {
      if (stopped.value || (error as Error).name === 'AbortError') {
        current.stopped = true
        showToast(t('promptOptimization.stopped'), 'warning')
      } else if (!current.result.trim()) {
        removeRound(round.id)
        showToast(`${t('promptOptimization.optimizeFailed')}: ${(error as Error).message}`, 'danger')
      } else {
        showToast(`${t('promptOptimization.optimizeFailed')}: ${(error as Error).message}`, 'danger')
      }
    }
  } finally {
    optimizing.value = false
    stopped.value = false
  }
}

const runOptimization = async () => {
  if (!prompt.value || !canOptimize.value) {
    if (presetId.value === 'custom' && !customInstruction.value.trim()) {
      showToast(t('promptOptimization.customRequired'), 'warning')
    }
    return
  }

  const preset = OPTIMIZATION_PRESETS.find(item => item.id === presetId.value)
  const pair = buildOptimizationPrompt({
    content: originalContent.value,
    target: target.value,
    presetId: presetId.value,
    customInstruction: customInstruction.value
  })

  await startRound({
    systemPrompt: pair.system,
    userPrompt: pair.user,
    instruction: presetId.value === 'custom' ? customInstruction.value.trim() : t(preset?.nameKey || 'promptOptimization.title'),
    presetLabel: t(preset?.nameKey || 'promptOptimization.title')
  })
}

const runIteration = async () => {
  if (!canIterate.value) return
  const pair = buildIterationPrompt({
    originalContent: originalContent.value,
    previousResult: activeResult.value,
    instruction: iterationInstruction.value,
    target: target.value
  })

  await startRound({
    systemPrompt: pair.system,
    userPrompt: pair.user,
    instruction: iterationInstruction.value.trim(),
    presetLabel: t('promptOptimization.iterateTitle')
  })
}

const stopOptimization = () => {
  stopped.value = true
  AIGeneratorService.stopChat()
}

const runEvaluation = async () => {
  const round = activeRound.value
  const config = selectedConfig.value
  const model = selectedModel.value
  if (!round || !round.result.trim() || !config || !model || evaluating.value) {
    if (!round?.result.trim()) showToast(t('promptOptimization.noResult'), 'warning')
    return
  }

  evaluating.value = true
  evaluationError.value = ''
  round.evaluation = null
  round.evaluationRaw = ''

  const pair = buildEvaluationPrompt({
    original: originalContent.value,
    optimized: round.result,
    target: target.value,
    variables: originalVariables.value
  })

  try {
    const raw = await AIGeneratorService.generateChat(
      config,
      model,
      pair.system,
      pair.user,
      undefined,
      { temperature: 0.1, maxTokens: 2500 }
    )
    round.evaluationRaw = raw
    const parsed = parseEvaluationResponse(raw)
    if (!parsed) {
      evaluationError.value = t('promptOptimization.evaluationParseFailed')
      return
    }
    round.evaluation = parsed
  } catch (error) {
    evaluationError.value = t('promptOptimization.evaluationFailed', { error: (error as Error).message })
  } finally {
    evaluating.value = false
  }
}

// ========== 执行式评估（借鉴 prompt-optimizer 的测试输入/快照/对比评估） ==========

const maxExecutionTestCases = MAX_EXECUTION_TEST_CASES

const executionStorageKey = computed(() => `promptOptimization:testCases:${prompt.value?.id ?? 'none'}`)

const createEmptyCase = (): ExecutionTestCase => ({
  id: `case_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  values: Object.fromEntries(originalVariables.value.map(name => [name, ''])),
  userMessage: ''
})

const addTestCase = () => {
  if (testCases.value.length >= MAX_EXECUTION_TEST_CASES) return
  testCases.value.push(createEmptyCase())
}

const removeTestCase = (id: string) => {
  testCases.value = testCases.value.filter(testCase => testCase.id !== id)
  expandedCaseIds.value = expandedCaseIds.value.filter(caseId => caseId !== id)
}

const isCaseExpanded = (id: string): boolean => expandedCaseIds.value.includes(id)

const toggleCaseExpanded = (id: string) => {
  expandedCaseIds.value = isCaseExpanded(id)
    ? expandedCaseIds.value.filter(caseId => caseId !== id)
    : [...expandedCaseIds.value, id]
}

const snapshotsForCase = (testCaseId: string): ExecutionSnapshot[] => {
  return (executionState.value?.snapshots || []).filter(snapshot => snapshot.testCaseId === testCaseId)
}

const testCaseDisplayName = (testCaseId: string): string => {
  const index = testCases.value.findIndex(testCase => testCase.id === testCaseId)
  return index >= 0
    ? t('promptOptimization.testCaseLabel', { index: index + 1 })
    : testCaseId
}

const loadStoredTestCases = () => {
  try {
    const raw = localStorage.getItem(executionStorageKey.value)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return
    testCases.value = parsed
      .filter((item: any) => item && typeof item === 'object')
      .slice(0, MAX_EXECUTION_TEST_CASES)
      .map((item: any, index: number) => ({
        id: `case_${index + 1}_${Math.random().toString(36).slice(2, 6)}`,
        values: Object.fromEntries(
          originalVariables.value.map(name => [
            name,
            typeof item.values?.[name] === 'string' ? item.values[name] : ''
          ])
        ),
        userMessage: typeof item.userMessage === 'string' ? item.userMessage : ''
      }))
  } catch {
    // 本地缓存只是便利功能，损坏时直接忽略
  }
}

watch(testCases, () => {
  try {
    localStorage.setItem(
      executionStorageKey.value,
      JSON.stringify(testCases.value.map(({ values, userMessage }) => ({ values, userMessage })))
    )
  } catch {
    // 私有模式或空间不足时静默放弃持久化
  }
}, { deep: true })

const generateTestInputs = async () => {
  const config = selectedConfig.value
  const model = selectedModel.value
  if (!config || !model || generatingInputs.value) {
    if (!config || !model) showToast(t('promptOptimization.noModel'), 'warning')
    return
  }

  generatingInputs.value = true
  try {
    // 无变量的用户提示词只有一种执行方式，一组即可；其余生成满额供挑选
    const count = originalVariables.value.length > 0 ? MAX_EXECUTION_TEST_CASES : 1
    const pair = buildAITestInputsPrompt({
      content: originalContent.value,
      target: target.value,
      variables: originalVariables.value,
      count
    })
    const raw = await AIGeneratorService.generateChat(
      config, model, pair.system, pair.user, undefined, { temperature: 0.3, maxTokens: 2000 }
    )
    const parsed = parseAITestInputs(raw, originalVariables.value, count)
    if (!parsed) {
      showToast(t('promptOptimization.testInputParseFailed'), 'danger')
      return
    }
    testCases.value = parsed
    expandedCaseIds.value = []
    showToast(t('promptOptimization.testInputGenerated'), 'success')
  } catch (error) {
    showToast(`${t('promptOptimization.testInputFailed')}: ${(error as Error).message}`, 'danger')
  } finally {
    generatingInputs.value = false
  }
}

const estimatedExecutionCalls = computed(() => testCases.value.length * 2 + 1)

const canExecuteTests = computed(() => {
  return Boolean(
    activeRound.value
    && activeResult.value.trim()
    && selectedConfig.value
    && selectedModel.value
    && testCases.value.length > 0
    && missingVariables.value.length === 0
    && !executing.value
    && !comparing.value
    && !optimizing.value
  )
})

const canRunExecutionCompare = computed(() => {
  return Boolean(
    executionState.value
    && executionState.value.snapshots.length > 0
    && selectedConfig.value
    && selectedModel.value
    && !executing.value
    && !comparing.value
    && !optimizing.value
  )
})

const runExecutionTests = async () => {
  const round = activeRound.value
  const config = selectedConfig.value
  const model = selectedModel.value
  if (!round || !round.result.trim() || !config || !model || executing.value) {
    if (!round?.result.trim()) showToast(t('promptOptimization.noResult'), 'warning')
    return
  }
  if (missingVariables.value.length > 0) {
    showToast(t('promptOptimization.executionBlockedVariables', {
      variables: missingVariables.value.join(', ')
    }), 'warning')
    return
  }
  if (testCases.value.length === 0) addTestCase()

  executing.value = true
  executingStopped.value = false
  executionError.value = ''
  round.execution = { snapshots: [], evaluation: null, raw: '' }

  const snapshots: ExecutionSnapshot[] = []
  const total = testCases.value.length

  try {
    for (let index = 0; index < total; index += 1) {
      const testCase = testCases.value[index]

      for (const promptRef of ['original', 'optimized'] as const) {
        if (executingStopped.value) break

        executionProgress.value = t('promptOptimization.executionProgress', {
          index: index + 1,
          total,
          version: promptRef === 'original'
            ? t('promptOptimization.executionOriginal')
            : t('promptOptimization.executionOptimized')
        })

        const content = promptRef === 'original' ? originalContent.value : round.result
        const messages = buildExecutionMessages({
          content,
          testCase,
          target: target.value,
          isJinja: prompt.value?.isJinjaTemplate || false
        })

        const output = await AIGeneratorService.generateChat(
          config, model, messages.system, messages.user, undefined,
          { temperature: 0.7, maxTokens: 2000 }
        )

        snapshots.push({
          id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          testCaseId: testCase.id,
          promptRef,
          // 记录实际发给模型的那一侧：系统提示词场景是 system，用户提示词场景是 user
          promptText: target.value === 'system' ? messages.system : messages.user,
          output,
          createdAt: Date.now()
        })
        // 逐个快照推进，UI 能看到进度
        round.execution = { snapshots: [...snapshots], evaluation: null, raw: '' }
      }
      if (executingStopped.value) break
    }

    if (executingStopped.value) {
      showToast(t('promptOptimization.stopped'), 'warning')
    } else if (snapshots.length === 0) {
      executionError.value = t('promptOptimization.executionFailed', { error: 'no output' })
    } else {
      showToast(t('promptOptimization.executionDone'), 'success')
    }
  } catch (error) {
    if (executingStopped.value || (error as Error).name === 'AbortError') {
      showToast(t('promptOptimization.stopped'), 'warning')
    } else {
      executionError.value = t('promptOptimization.executionFailed', { error: (error as Error).message })
    }
  } finally {
    executing.value = false
    executingStopped.value = false
    executionProgress.value = ''
  }
}

const stopExecution = () => {
  executingStopped.value = true
  AIGeneratorService.stopChat()
}

const runExecutionCompare = async () => {
  const round = activeRound.value
  const config = selectedConfig.value
  const model = selectedModel.value
  const snapshots = round?.execution?.snapshots || []
  if (!round || !config || !model || !snapshots.length || comparing.value) {
    if (!snapshots.length) showToast(t('promptOptimization.executionTestsRequired'), 'warning')
    return
  }

  comparing.value = true
  executionError.value = ''
  if (!round.execution) return
  round.execution.evaluation = null
  round.execution.raw = ''

  const pair = buildExecutionEvalPrompt({
    target: target.value,
    variables: originalVariables.value,
    testCases: testCases.value,
    snapshots
  })

  try {
    const raw = await AIGeneratorService.generateChat(
      config, model, pair.system, pair.user, undefined, { temperature: 0.1, maxTokens: 2500 }
    )
    round.execution.raw = raw
    const parsed = parseExecutionEvalResponse(raw)
    if (!parsed) {
      executionError.value = t('promptOptimization.evaluationParseFailed')
      return
    }
    round.execution.evaluation = parsed
  } catch (error) {
    executionError.value = t('promptOptimization.evaluationFailed', { error: (error as Error).message })
  } finally {
    comparing.value = false
  }
}

const copyResult = async () => {
  if (!activeResult.value.trim()) {
    showToast(t('promptOptimization.noResult'), 'warning')
    return
  }
  try {
    await navigator.clipboard.writeText(activeResult.value)
    showToast(t('promptOptimization.copySuccess'), 'success')
  } catch (error) {
    console.error('复制优化结果失败:', error)
    showToast(t('promptOptimization.copyFailed'), 'danger')
  }
}

const createHistoryRecord = async (content: string) => {
  const currentPrompt = prompt.value
  if (!currentPrompt?.id) return

  try {
    const latestVersion = await api.promptHistories.getLatestVersion.query(currentPrompt.id)
    await api.promptHistories.create.mutate({
      promptId: currentPrompt.id,
      version: latestVersion + 1,
      title: currentPrompt.title,
      content,
      description: currentPrompt.description,
      categoryId: currentPrompt.categoryId,
      tags: Array.isArray(currentPrompt.tags) ? currentPrompt.tags.join(',') : currentPrompt.tags,
      variables: JSON.stringify(currentPrompt.variables || []),
      isJinjaTemplate: currentPrompt.isJinjaTemplate || false,
      changeDescription: t('promptOptimization.historyChangeDescription'),
      uuid: `history_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date()
    })
  } catch (error) {
    // 历史记录是附加保障，写入失败不应阻止已经把优化结果写回提示词
    console.warn('创建提示词优化历史失败:', error)
  }
}

const applyResult = async () => {
  const currentPrompt = prompt.value
  const result = activeResult.value
  if (!currentPrompt?.id || !result.trim() || applying.value) return
  if (missingVariables.value.length > 0) {
    showToast(t('promptOptimization.missingVariables', {
      variables: missingVariables.value.join(', ')
    }), 'warning')
    return
  }

  const alert = await alertController.create({
    header: t('promptOptimization.applyConfirmTitle'),
    message: t('promptOptimization.applyConfirmMessage'),
    buttons: [
      { text: t('common.cancel'), role: 'cancel' },
      {
        text: t('promptOptimization.apply'),
        handler: async () => {
          applying.value = true
          try {
            await api.prompts.update.mutate({
              id: currentPrompt.id!,
              data: {
                ...currentPrompt,
                content: result
              }
            })
            await createHistoryRecord(result)
            showToast(t('promptOptimization.applied'), 'success')
            router.back()
          } catch (error) {
            console.error('应用优化结果失败:', error)
            showToast(t('promptOptimization.applyFailed'), 'danger')
          } finally {
            applying.value = false
          }
        }
      }
    ]
  })

  await alert.present()
}

const showToast = async (message: string, color: string = 'success') => {
  await presentMobileToast(message, color)
}

onMounted(() => {
  void loadPage()
})

// 从「添加 AI 配置」返回时刷新配置；已有的模型选择在仍然可用时保留
onIonViewWillEnter(() => {
  if (!loading.value) void loadConfigs()
})

onUnmounted(() => {
  if (optimizing.value || executing.value || generatingInputs.value) {
    AIGeneratorService.stopChat()
  }
})
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-container.compact {
  padding: 28px 20px;
}

.empty-icon {
  color: var(--ion-color-medium);
  margin-bottom: var(--spacing-lg);
}

.empty-text {
  color: var(--ion-color-medium);
  margin-bottom: 4px;
}

.optimize-flow {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-md) var(--mobile-page-gutter)
    calc(env(safe-area-inset-bottom, 0px) + 100px);
}

.optimize-card {
  background: var(--surface-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
}

.card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.card-heading-copy {
  min-width: 0;
}

.card-heading h2,
.section-heading {
  margin: 0;
  color: var(--content-primary);
  font-size: var(--mobile-font-size-title);
  font-weight: 600;
}

.card-subtitle {
  margin: 4px 0 0;
  color: var(--content-secondary);
  font-size: var(--mobile-font-size-footnote);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-action {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 0;
  border: 0;
  background: transparent;
  color: var(--accent-primary);
  font-family: inherit;
  font-size: var(--mobile-font-size-footnote);
  cursor: pointer;
}

.text-action ion-icon {
  font-size: var(--mobile-icon-size-sm);
}

.original-content {
  margin: 0;
  padding: var(--spacing-sm);
  max-height: 132px;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--surface-secondary);
  color: var(--content-primary);
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-size: var(--mobile-font-size-footnote);
  line-height: var(--mobile-line-height-normal);
  white-space: pre-wrap;
  word-break: break-word;
}

.original-content.is-expanded {
  max-height: none;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: var(--spacing-sm);
  color: var(--content-secondary);
  font-size: var(--mobile-font-size-caption);
}

.variable-chip {
  padding: 2px 7px;
  border-radius: 10px;
  background: var(--surface-tertiary);
  color: var(--content-secondary);
  font-size: var(--mobile-font-size-caption);
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: var(--spacing-md);
}

.field-label {
  color: var(--content-secondary);
  font-size: var(--mobile-font-size-footnote);
  font-weight: 600;
}

.field-hint {
  margin: 0;
  color: var(--content-secondary);
  font-size: var(--mobile-font-size-caption);
  line-height: var(--mobile-line-height-normal);
}

.target-segment {
  width: 100%;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-sm);
}

.preset-option {
  min-height: 78px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--surface-primary);
  color: var(--content-primary);
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: none;
  appearance: none;
}

.preset-option.active {
  background: var(--surface-tertiary);
}

.preset-name {
  font-size: var(--mobile-font-size-body);
  font-weight: 600;
}

.preset-description {
  color: var(--content-secondary);
  font-size: var(--mobile-font-size-caption);
  line-height: var(--mobile-line-height-normal);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.prompt-textarea,
.result-textarea {
  --background: var(--surface-secondary);
  --padding-start: var(--spacing-sm);
  --padding-end: var(--spacing-sm);
  --padding-top: var(--spacing-sm);
  --padding-bottom: var(--spacing-sm);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  color: var(--content-primary);
  font-size: var(--mobile-font-size-body);
  line-height: var(--mobile-line-height-normal);
}

.result-textarea {
  max-height: 460px;
  overflow-y: auto;
}

.model-row {
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding: 0 var(--spacing-sm);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--surface-secondary);
  color: var(--content-primary);
  font-family: inherit;
  font-size: var(--mobile-font-size-body);
  text-align: left;
  cursor: pointer;
}

.model-row:disabled {
  opacity: 0.6;
}

.model-row-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-row ion-icon {
  flex: 0 0 auto;
  color: var(--content-tertiary);
  font-size: var(--mobile-icon-size-sm);
}

.primary-action,
.secondary-action {
  margin-top: var(--spacing-md);
}

.result-heading {
  align-items: center;
}

.round-tabs {
  display: flex;
  gap: 6px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.round-tabs::-webkit-scrollbar {
  display: none;
}

.round-tab {
  flex: 0 0 auto;
  padding: 4px 9px;
  border: 1px solid var(--border-default);
  border-radius: 999px;
  background: var(--surface-primary);
  color: var(--content-secondary);
  font-family: inherit;
  font-size: var(--mobile-font-size-caption);
  cursor: pointer;
}

.round-tab.active {
  background: var(--surface-tertiary);
  color: var(--content-primary);
}

.result-segment {
  width: 100%;
  margin-top: var(--spacing-sm);
}

.tab-panel {
  margin-top: var(--spacing-md);
}

.inline-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.compare-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  color: var(--content-secondary);
  font-size: var(--mobile-font-size-caption);
}

.diff-stat-added {
  color: var(--accent-success);
}

.diff-stat-removed {
  color: var(--accent-error);
}

.diff-view {
  max-height: 440px;
  overflow: auto;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--surface-secondary);
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-size: var(--mobile-font-size-caption);
  line-height: 1.5;
}

.diff-row {
  display: flex;
  gap: 4px;
  padding: 2px var(--spacing-sm);
  white-space: pre-wrap;
  word-break: break-word;
}

.diff-row.added {
  background: color-mix(in srgb, var(--accent-success) 12%, transparent);
}

.diff-row.removed {
  background: color-mix(in srgb, var(--accent-error) 12%, transparent);
}

.diff-sign {
  flex: 0 0 10px;
  color: var(--content-tertiary);
  user-select: none;
}

.diff-row.added .diff-sign {
  color: var(--accent-success);
}

.diff-row.removed .diff-sign {
  color: var(--accent-error);
}

.diff-text {
  min-width: 0;
}

.diff-word.removed {
  border-radius: 3px;
  background: color-mix(in srgb, var(--accent-error) 26%, transparent);
}

.diff-word.added {
  border-radius: 3px;
  background: color-mix(in srgb, var(--accent-success) 26%, transparent);
}

.score-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) 0 var(--spacing-md);
}

.score-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.score-value {
  color: var(--content-primary);
  font-size: var(--mobile-font-size-display);
  font-weight: 700;
  line-height: 1;
}

.score-block.optimized .score-value {
  color: var(--accent-primary);
}

.score-label {
  color: var(--content-secondary);
  font-size: var(--mobile-font-size-caption);
}

.score-arrow {
  color: var(--content-tertiary);
}

.dimension-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.dimension-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  color: var(--content-secondary);
  font-size: var(--mobile-font-size-caption);
}

.dimension-bars {
  position: relative;
  height: 8px;
  margin-top: 4px;
  border-radius: 999px;
  background: var(--surface-tertiary);
  overflow: hidden;
}

.dimension-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 999px;
}

.dimension-bar.original {
  background: var(--content-tertiary);
}

.dimension-bar.optimized {
  height: 50%;
  top: 50%;
  background: var(--accent-primary);
}

.evaluation-summary {
  margin: var(--spacing-md) 0 0;
  color: var(--content-primary);
  font-size: var(--mobile-font-size-body);
  line-height: var(--mobile-line-height-normal);
}

.improvement-list {
  margin-top: var(--spacing-md);
}

.improvement-list h3 {
  margin: 0 0 6px;
  color: var(--content-secondary);
  font-size: var(--mobile-font-size-footnote);
}

.improvement-list ul {
  margin: 0;
  padding-left: 18px;
  color: var(--content-secondary);
  font-size: var(--mobile-font-size-footnote);
  line-height: var(--mobile-line-height-relaxed);
}

.evaluation-error,
.evaluation-hint {
  color: var(--content-secondary);
  font-size: var(--mobile-font-size-footnote);
  line-height: var(--mobile-line-height-normal);
}

.evaluation-raw {
  max-height: 220px;
  overflow: auto;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  background: var(--surface-secondary);
  color: var(--content-secondary);
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-size: var(--mobile-font-size-caption);
  white-space: pre-wrap;
  word-break: break-word;
}

.eval-mode-segment {
  width: 100%;
  margin-bottom: var(--spacing-sm);
}

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.text-action.danger {
  color: var(--accent-error);
}

.test-case-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--surface-secondary);
}

.test-case-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--content-primary);
  font-size: var(--mobile-font-size-footnote);
  font-weight: 600;
}

.case-values {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.case-value-input {
  --background: var(--surface-primary);
  border-radius: var(--radius-md);
  font-size: var(--mobile-font-size-body);
}

.snapshot-list {
  margin-top: var(--spacing-md);
}

.snapshot-list h3,
.finding-list h3 {
  margin: 0 0 6px;
  color: var(--content-secondary);
  font-size: var(--mobile-font-size-footnote);
}

.snapshot-group {
  margin-bottom: var(--spacing-sm);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.snapshot-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
  border: 0;
  background: var(--surface-secondary);
  color: var(--content-primary);
  font-family: inherit;
  font-size: var(--mobile-font-size-footnote);
  font-weight: 600;
  cursor: pointer;
}

.snapshot-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-top: 1px solid var(--border-subtle);
  background: var(--surface-primary);
}

.snapshot-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.snapshot-tag {
  align-self: flex-start;
  padding: 1px 7px;
  border-radius: 10px;
  font-size: var(--mobile-font-size-caption);
}

.snapshot-tag.original {
  background: var(--surface-tertiary);
  color: var(--content-secondary);
}

.snapshot-tag.optimized {
  background: color-mix(in srgb, var(--accent-primary) 14%, transparent);
  color: var(--accent-primary);
}

.snapshot-output {
  margin: 0;
  max-height: 200px;
  overflow: auto;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--surface-secondary);
  color: var(--content-primary);
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-size: var(--mobile-font-size-caption);
  line-height: var(--mobile-line-height-normal);
  white-space: pre-wrap;
  word-break: break-word;
}

.execution-progress {
  margin: var(--spacing-sm) 0 0;
  color: var(--content-secondary);
  font-size: var(--mobile-font-size-footnote);
}

.finding-list {
  margin-top: var(--spacing-md);
}

.finding-item {
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-subtle);
}

.finding-item:last-child {
  border-bottom: 0;
}

.finding-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.finding-case {
  color: var(--content-primary);
  font-size: var(--mobile-font-size-footnote);
  font-weight: 600;
}

.finding-text {
  margin: 4px 0 0;
  color: var(--content-secondary);
  font-size: var(--mobile-font-size-caption);
  line-height: var(--mobile-line-height-normal);
}

.warning-text {
  color: var(--accent-warning);
}

.success-text {
  color: var(--accent-success);
}

.optimize-action-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--mobile-page-gutter)
    calc(env(safe-area-inset-bottom, 0px) + var(--spacing-sm));
  border-top: 1px solid var(--border-default);
  background: var(--surface-primary);
}

.action-bar-button {
  flex: 1 1 0;
  min-width: 0;
}

.preferred-star {
  margin-left: 4px;
}

ion-content {
  --background: var(--surface-body);
}
</style>
