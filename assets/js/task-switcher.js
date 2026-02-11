document.addEventListener('DOMContentLoaded', function () {
  const taskButtonsContainer = document.getElementById('task-buttons');
  const taskViewer = document.getElementById('task-viewer');
  const initialObservationImg = document.getElementById('initial-observation');
  const generatedVideo = document.getElementById('generated-video');
  const executionVideo = document.getElementById('execution-video');
  const trajectorySelect = document.getElementById('trajectory-type');

  // Per-step configuration
  // Using relative path pattern verified from directory listing
  const stepConfig = {
    step_1: {
      assetsDir: 'assets/mp4/step_1',
      startImg: 'start.png',
      genVideo: 'rgb_video_16fps_1.mp4',
      execVideo: 'camera0_1.mp4',
      viserPrefix: 'assets/viser-client/step_1'
    },
    step_2: {
      assetsDir: 'assets/mp4/step_2',
      startImg: 'start.png',
      genVideo: 'rgb_video_16fps_2.mp4',
      execVideo: 'camera0_2.mp4',
      viserPrefix: 'assets/viser-client/step_2'
    },
    step_3: {
      assetsDir: 'assets/mp4/step_3',
      startImg: 'start.png',
      genVideo: 'rgb_video_16fps_3.mp4',
      execVideo: 'camera0_3.mp4', // inferred
      viserPrefix: 'assets/viser-client/step_3'
    },
    step_4: {
      assetsDir: 'assets/mp4/step_4',
      startImg: 'start.png',
      genVideo: 'rgb_video_16fps_4.mp4', // inferred
      execVideo: 'camera0_4.mp4', // inferred
      viserPrefix: 'assets/viser-client/step_4'
    },
    step_4_recovery: {
      assetsDir: 'assets/mp4/step_4_recovery',
      startImg: 'start.png', // inferred, might be start_clean.png but defaulting for consistency unless explicitly mapped differently
      genVideo: 'rgb_video_16fps_4_recovery.mp4',
      execVideo: 'camera0_4_recovery.mp4',
      viserPrefix: 'assets/viser-client/step_4_recovery'
    },
  };

  // Special handling for recovery step image if needed, based on file list
  stepConfig.step_4_recovery.startImg = 'start_clean.png';

  // Build viser iframe URL for a given step + trajectory type
  const buildSrc = (step, trajectory) => {
    const config = stepConfig[step];
    if (!config) return '';
    // Construct viser file path: e.g. step_1_object.viser
    const viserFile = `${config.viserPrefix}_${trajectory}.viser`;
    // We traverse up from assets/viser-client/ index.html to find the .viser file relative to it?
    // Actually the playbackPath in viser-client seems to be relative to the client's index.html location?
    // Current location: assets/viser-client/index.html
    // playbackPath=../step_1_object.viser means assets/step_1_object.viser

    // Let's assume the .viser files are in assets/ (same level as viser-client folder)
    // So prefix 'assets/viser-client/step_1' is wrong for file path, but... 
    // Wait, the previous code was: playbackPath=../example_recording.viser
    // This means example_recording.viser is in assets/.

    // So if my prefix is 'assets/viser-client/step_1', then `${config.viserPrefix}_${trajectory}.viser` 
    // becomes `assets/viser-client/step_1_object.viser`.
    // Relative to `assets/viser-client/`, that is `step_1_object.viser`.
    // So path should be just `step_1_object.viser` if the file is inside `assets/viser-client/`.
    // BUT typically we put them in `assets/`.

    // Let's assume files are in `assets/`.
    // So path relative to `assets/viser-client/` is `../step_1_object.viser`.

    // Let's use simple string logic:
    // We want the final relative path passed to playbackPath to be `../step_1_object.viser`.

    const filename = `${step}_${trajectory}.viser`;
    return `assets/viser-client/?playbackPath=../${filename}&initialCameraPosition=0,0,0&initialCameraLookAt=0.0,0.0,1.0&initialCameraUp=0.0,-1.0,0.0`;
  };

  // Currently active step
  let currentStep = 'step_1';

  const updateMediaSources = (step) => {
    currentStep = step;
    const config = stepConfig[step];
    if (!config) return;

    const trajectory = trajectorySelect.value;

    initialObservationImg.src = `${config.assetsDir}/${config.startImg}`;
    generatedVideo.src = `${config.assetsDir}/${config.genVideo}`;
    executionVideo.src = `${config.assetsDir}/${config.execVideo}`;
    taskViewer.src = buildSrc(step, trajectory);
  };

  // Step tab clicks
  taskButtonsContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('task-button')) {
      taskButtonsContainer.querySelectorAll('.task-button').forEach(button => {
        button.classList.remove('active');
      });
      e.target.classList.add('active');
      const selectedTask = e.target.dataset.value;
      updateMediaSources(selectedTask);
    }
  });

  // Trajectory dropdown changes — only reload the iframe
  trajectorySelect.addEventListener('change', function () {
    const trajectory = trajectorySelect.value;
    taskViewer.src = buildSrc(currentStep, trajectory);
  });

  // Set the initial view
  const initialButton = taskButtonsContainer.querySelector('.task-button.active');
  if (initialButton) {
    const initialTask = initialButton.dataset.value;
    updateMediaSources(initialTask);
  }
});
