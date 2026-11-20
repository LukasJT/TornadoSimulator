export const stages = ['Lift', 'Growth', 'Mature', 'Decay'];

export function getStage(minute, pace = 1) {
  return Math.min(3, Math.floor(minute / (15 * pace)));
}

export function drawCrossSection(canvas, stage, { letters = false, reveal = false } = {}) {
  const context = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  context.clearRect(0, 0, W, H);
  context.save();
  context.scale(W / 540, H / 240);
  context.fillStyle = '#121f30';
  context.fillRect(0, 0, 540, 240);
  context.strokeStyle = '#35485f';
  context.lineWidth = 1;
  for (const y of [36, 88, 140, 192]) {
    context.beginPath();
    context.moveTo(26, y);
    context.lineTo(514, y);
    context.stroke();
  }
  context.fillStyle = '#293d37';
  context.fillRect(0, 211, 540, 29);
  const top = [145, 78, 49, 113][stage];
  context.fillStyle = '#4e6482';
  context.beginPath();
  context.moveTo(105, 164);
  context.bezierCurveTo(122, 140, 139, top, 255, top);
  context.bezierCurveTo(288, top - 8, 404, top + 14, 451, top + 28);
  context.bezierCurveTo(372, top + 39, 360, 145, 406, 163);
  context.closePath();
  context.fill();
  function arrow(from, to, color) {
    const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
    context.strokeStyle = color;
    context.lineWidth = 6;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(...from);
    context.lineTo(...to);
    for (const offset of [-0.55, 0.55]) {
      context.moveTo(...to);
      context.lineTo(to[0] - 14 * Math.cos(angle + offset), to[1] - 14 * Math.sin(angle + offset));
    }
    context.stroke();
  }
  arrow([88, 198], [164, 193], letters && !reveal ? '#e8eef7' : '#b7d8fa');
  arrow([197, 192], [stage === 0 ? 204 : 250, top + 16], letters && !reveal ? '#e8eef7' : '#ffbf78');
  if (stage > 0) arrow([348, top + 41], [364, 196], letters && !reveal ? '#e8eef7' : '#84d9e4');
  if (letters) {
    context.font = 'bold 23px system-ui, sans-serif';
    context.fillStyle = '#f1f6ff';
    context.fillText('A', 70, 179);
    context.fillText('B', 210, 128);
    context.fillText('C', 376, 149);
  }
  context.restore();
}

const exercise = document.getElementById('updraft-exercise');
if (exercise) {
  const answer = document.getElementById('updraft-answer');
  const render = () => drawCrossSection(exercise, 2, { letters: true, reveal: answer.open });
  render();
  answer.addEventListener('toggle', render);
}
